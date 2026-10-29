/**
 * Kafka Reliability, Idempotency & Dead-Letter Queue (DLQ) Simulator
 * Directly implementing Experiment 8.1 & 8.2:
 * - OrderEvent producer / consumer with JSON serialization
 * - Idempotency via atomic 'processed_events' check (INSERT IGNORE)
 * - Exponential backoff retry mechanism (1s, 2s, 4s) with max 3 attempts
 * - Dead Letter Topic routing ('orders.DLT') with event tracking state machine
 * - Dead-letter event replay capability
 */

import { EventStatus, EventTrackingRecord, OrderEvent } from '../types';

export class KafkaReliabilitySimulator {
  private static processedEventsTable: Set<string> = new Set();
  private static trackingRecords: Map<string, EventTrackingRecord> = new Map();
  private static deadLetterEvents: OrderEvent[] = [];
  private static listeners: ((events: EventTrackingRecord[], dlq: OrderEvent[]) => void)[] = [];

  static subscribe(fn: (events: EventTrackingRecord[], dlq: OrderEvent[]) => void) {
    this.listeners.push(fn);
    fn(this.getTrackingRecords(), [...this.deadLetterEvents]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private static notify() {
    const list = this.getTrackingRecords();
    const dlq = [...this.deadLetterEvents];
    this.listeners.forEach((fn) => fn(list, dlq));
  }

  static getTrackingRecords(): EventTrackingRecord[] {
    return Array.from(this.trackingRecords.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static getDeadLetterQueue(): OrderEvent[] {
    return [...this.deadLetterEvents];
  }

  static clearAll() {
    this.processedEventsTable.clear();
    this.trackingRecords.clear();
    this.deadLetterEvents = [];
    this.notify();
  }

  /**
   * Produce and send an OrderEvent into the Kafka broker
   */
  static async publishEvent(
    event: OrderEvent,
    onStatusUpdate?: (status: EventStatus, attempt: number, log: string) => void
  ): Promise<string> {
    const nowIso = new Date().toISOString();

    // Step 1: Mark PUBLISHING in event_tracking
    this.trackingRecords.set(event.eventId, {
      eventId: event.eventId,
      orderId: event.orderId,
      status: 'PUBLISHING',
      attemptCount: 0,
      lastError: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      topic: 'orders',
    });
    this.notify();
    onStatusUpdate?.('PUBLISHING', 0, `[Kafka Producer] Publishing event ${event.eventId} to topic "orders"`);

    await new Promise((r) => setTimeout(r, 400));

    // Step 2: Mark PUBLISHED
    const record = this.trackingRecords.get(event.eventId)!;
    record.status = 'PUBLISHED';
    record.updatedAt = new Date().toISOString();
    this.notify();
    onStatusUpdate?.('PUBLISHED', 0, `[Kafka Broker] Message confirmed on partition 0 (offset: ${Math.floor(Math.random() * 8000)})`);

    // Step 3: Trigger Asynchronous Consumer Execution
    this.consumeOrderEvent(event, onStatusUpdate);

    return event.eventId;
  }

  /**
   * Consumer processing with Idempotency & Exponential Backoff Retries
   */
  private static async consumeOrderEvent(
    event: OrderEvent,
    onStatusUpdate?: (status: EventStatus, attempt: number, log: string) => void
  ) {
    await new Promise((r) => setTimeout(r, 600));

    // IDEMPOTENCY CHECK (Exp 8.1 / 8.2)
    // "INSERT IGNORE INTO processed_events (event_id, processed_at) VALUES (?, CURRENT_TIMESTAMP)"
    if (this.processedEventsTable.has(event.eventId)) {
      const record = this.trackingRecords.get(event.eventId);
      if (record) {
        record.status = 'DUPLICATE';
        record.updatedAt = new Date().toISOString();
        this.notify();
      }
      onStatusUpdate?.(
        'DUPLICATE',
        0,
        `[Idempotency Guard] Duplicate event ID detected (${event.eventId}). Skipped processing to prevent duplicate debit/order creation.`
      );
      return;
    }

    // Attempt Execution with Exponential Backoff
    let attempt = 0;
    const maxRetries = 3;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      const currentBackoff = attempt === 1 ? 1000 : attempt === 2 ? 2000 : 4000;

      const record = this.trackingRecords.get(event.eventId);
      if (record) {
        record.status = 'RETRYING';
        record.attemptCount = attempt;
        record.updatedAt = new Date().toISOString();
        this.notify();
      }

      onStatusUpdate?.(
        'RETRYING',
        attempt,
        `[Kafka Consumer] Attempt ${attempt} of ${maxRetries}: Executing order transaction for ${event.orderId}...`
      );

      // Simulate backoff delay
      await new Promise((r) => setTimeout(r, 700));

      if (event.shouldFail) {
        const errorMsg = `Simulated processing failure at downstream payment gateway for ${event.orderId}`;
        if (record) {
          record.lastError = errorMsg;
          record.updatedAt = new Date().toISOString();
          this.notify();
        }
        onStatusUpdate?.(
          'RETRYING',
          attempt,
          `[Failure Handler] Attempt ${attempt} failed with: ${errorMsg}. Backoff wait: ${currentBackoff}ms`
        );
      } else {
        // Successful processing
        success = true;
        this.processedEventsTable.add(event.eventId);
        if (record) {
          record.status = 'PROCESSED';
          record.lastError = null;
          record.updatedAt = new Date().toISOString();
          this.notify();
        }
        onStatusUpdate?.(
          'PROCESSED',
          attempt,
          `[Order Consumer] Successfully committed order ${event.orderId} and claimed eventId in processed_events table.`
        );
        return;
      }
    }

    // If all retries exhausted: Route to Dead Letter Topic (DLT)
    const deadLetterRecord = this.trackingRecords.get(event.eventId);
    if (deadLetterRecord) {
      deadLetterRecord.status = 'DEAD_LETTERED';
      deadLetterRecord.topic = 'orders.DLT';
      deadLetterRecord.updatedAt = new Date().toISOString();
      this.deadLetterEvents.push({
        ...event,
        attemptCount: attempt,
        lastError: deadLetterRecord.lastError || 'Max retries exhausted (3 attempts)',
      });
      this.notify();
    }

    onStatusUpdate?.(
      'DEAD_LETTERED',
      attempt,
      `[DLQ Routing] Retries exhausted. DeadLetterPublishingRecoverer routed event ${event.eventId} to topic "orders.DLT"`
    );
  }

  /**
   * Replay an event from the Dead Letter Queue
   */
  static async replayDeadLetter(
    eventId: string,
    onStatusUpdate?: (status: EventStatus, attempt: number, log: string) => void
  ) {
    const idx = this.deadLetterEvents.findIndex((e) => e.eventId === eventId);
    if (idx === -1) return;

    const event = { ...this.deadLetterEvents[idx], shouldFail: false }; // fix fault on replay
    this.deadLetterEvents.splice(idx, 1);

    const record = this.trackingRecords.get(eventId);
    if (record) {
      record.topic = 'orders (replayed)';
      record.status = 'PUBLISHING';
      record.lastError = 'Replaying from DLQ...';
      record.updatedAt = new Date().toISOString();
      this.notify();
    }

    onStatusUpdate?.(
      'PUBLISHING',
      1,
      `[DLQ Replay] Reprocessing dead-letter event ${eventId} with patched downstream service...`
    );

    await this.consumeOrderEvent(event, onStatusUpdate);
  }
}
