import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Send, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock, 
  Layers, 
  Trash2, 
  Repeat,
  Play,
  RotateCcw
} from 'lucide-react';
import { EventStatus, EventTrackingRecord, OrderEvent } from '../types';
import { KafkaReliabilitySimulator } from '../services/kafkaService';

export const KafkaReliabilityDLQ: React.FC = () => {
  const [trackingRecords, setTrackingRecords] = useState<EventTrackingRecord[]>([]);
  const [deadLetterEvents, setDeadLetterEvents] = useState<OrderEvent[]>([]);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    '[Kafka Cluster] Broker reliability-kafka:9092 operational. Topics "orders" (partitions: 1) and "orders.DLT" initialized.',
  ]);

  // Form inputs
  const [orderId, setOrderId] = useState(`ord-${Math.floor(100 + Math.random() * 900)}`);
  const [orderItem, setOrderItem] = useState('Gaming Laptop RTX 4080');
  const [amount, setAmount] = useState(150000);
  const [forceFail, setForceFail] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastPublishedEventId, setLastPublishedEventId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = KafkaReliabilitySimulator.subscribe((records, dlq) => {
      setTrackingRecords(records);
      setDeadLetterEvents(dlq);
    });
    return unsubscribe;
  }, []);

  const addLog = (msg: string) => {
    setLiveLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 30),
    ]);
  };

  const handlePublish = async (overrideEventId?: string, overrideFail?: boolean) => {
    setIsPublishing(true);
    const eventId = overrideEventId || 'evt-' + Math.random().toString(36).substring(2, 10);
    const shouldFail = overrideFail !== undefined ? overrideFail : forceFail;

    const event: OrderEvent = {
      eventId,
      orderId: overrideEventId ? 'ord-dup-demo' : orderId,
      orderItem,
      amount,
      status: 'PUBLISHING',
      shouldFail,
      timestamp: Date.now(),
      attemptCount: 0,
    };

    setLastPublishedEventId(eventId);

    try {
      await KafkaReliabilitySimulator.publishEvent(event, (status, attempt, logMsg) => {
        addLog(logMsg);
      });
      if (!overrideEventId) {
        setOrderId(`ord-${Math.floor(100 + Math.random() * 900)}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishDuplicate = () => {
    if (!lastPublishedEventId) {
      alert('Publish an event first to test duplicate deduplication!');
      return;
    }
    handlePublish(lastPublishedEventId, false);
  };

  const handleReplayDLQ = (eventId: string) => {
    addLog(`Initiating manual DLQ replay for event: ${eventId}`);
    KafkaReliabilitySimulator.replayDeadLetter(eventId, (status, attempt, logMsg) => {
      addLog(logMsg);
    });
  };

  const processedCount = trackingRecords.filter((r) => r.status === 'PROCESSED').length;
  const duplicateCount = trackingRecords.filter((r) => r.status === 'DUPLICATE').length;
  const dlqCount = deadLetterEvents.length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
              EXPERIMENT 8.1 & 8.2
            </span>
            <span className="text-xs text-slate-400">Synthesis Module 4</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Event-Driven Kafka Reliability, Idempotency & DLQ Pipeline
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Decoupled asynchronous event stream, atomic deduplication, exponential backoff retries, and dead-letter recovery.
          </p>
        </div>

        {/* Kafka Metric Counters */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-5">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Processed (Committed)</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{processedCount}</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Duplicates Blocked</div>
            <div className="text-xl font-bold font-mono text-blue-400">{duplicateCount}</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">In DLQ (orders.DLT)</div>
            <div className="text-xl font-bold font-mono text-rose-400">{dlqCount}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Event Producer & Fault Injection */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                Kafka Event Producer (REST Gateway)
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                POST /api/orders
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Publish an order event into the Kafka cluster. Injects unique UUID for idempotency enforcement.
            </p>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300">Order Reference ID</label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Product / Item Payload</label>
                <input
                  type="text"
                  value={orderItem}
                  onChange={(e) => setOrderItem(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Transaction Value (INR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500 mt-1"
                />
              </div>

              {/* Fault Injection Checkbox (Exp 8.2) */}
              <div className="p-3 bg-slate-950/90 rounded-xl border border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Simulate Downstream Payment Failure
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Triggers 3 exponential retries (1s, 2s, 4s) then sends to orders.DLT
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={forceFail}
                  onChange={(e) => setForceFail(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 bg-slate-800 border-slate-700 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Producer Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => handlePublish()}
                disabled={isPublishing}
                className="py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'Publishing...' : 'Publish Event'}</span>
              </button>

              <button
                onClick={handlePublishDuplicate}
                disabled={isPublishing || !lastPublishedEventId}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Repeat className="w-4 h-4" />
                <span>Send Duplicate Event</span>
              </button>
            </div>
          </div>

          {/* Dead Letter Queue (DLQ / orders.DLT) Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Dead Letter Queue (`orders.DLT`)
              </h4>
              <span className="text-xs font-mono bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded">
                {deadLetterEvents.length} events
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Isolates poisoned messages that exhausted all 3 exponential retries. Allows inspecting errors and replaying.
            </p>

            {deadLetterEvents.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No dead-lettered events. Check "Simulate Downstream Failure" and publish to test DLQ routing!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {deadLetterEvents.map((dl) => (
                  <div
                    key={dl.eventId}
                    className="p-3 bg-slate-950/80 border border-rose-900/50 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-rose-300">
                        {dl.orderId}
                      </span>
                      <button
                        onClick={() => handleReplayDLQ(dl.eventId)}
                        className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Replay & Recover</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Item: <strong className="text-slate-200">{dl.orderItem}</strong> (₹{dl.amount.toLocaleString()})
                    </div>
                    <div className="text-[10px] font-mono text-rose-400/90 bg-rose-950/40 p-1.5 rounded">
                      Error: {dl.lastError}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Event Tracking Table & Live Kafka Broker Log */}
        <div className="lg:col-span-7 space-y-6">
          {/* MySQL event_tracking Table (Exp 8.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Database Event Tracking State (`event_tracking`)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronous database table updating event statuses across producer, consumer, and DLT.
                </p>
              </div>
              <button
                onClick={() => KafkaReliabilitySimulator.clearAll()}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Reset Events
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Event UUID</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Topic</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Attempts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {trackingRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No events logged yet. Publish an event using the producer panel.
                      </td>
                    </tr>
                  ) : (
                    trackingRecords.map((rec) => (
                      <tr key={rec.eventId} className="hover:bg-slate-800/40 transition">
                        <td className="py-2.5 px-3 text-cyan-300 text-[11px]">
                          {rec.eventId.substring(0, 10)}...
                        </td>
                        <td className="py-2.5 px-3 text-slate-200">{rec.orderId}</td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">{rec.topic}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.status === 'PROCESSED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : rec.status === 'DUPLICATE'
                              ? 'bg-blue-950 text-blue-400 border border-blue-800'
                              : rec.status === 'DEAD_LETTERED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : rec.status === 'RETRYING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{rec.attemptCount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time Kafka Broker & Consumer Logs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Kafka Consumer & Retry Listener Stream
            </h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 max-h-56 overflow-y-auto">
              {liveLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('DUPLICATE')
                      ? 'text-blue-400'
                      : log.includes('DEAD_LETTERED') || log.includes('failed')
                      ? 'text-rose-400'
                      : log.includes('PROCESSED') || log.includes('Successfully')
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
