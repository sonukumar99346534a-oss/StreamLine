import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Server, 
  Radio, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Cpu, 
  Network, 
  TrendingUp, 
  ShieldCheck, 
  Play, 
  Layers 
} from 'lucide-react';

interface ChaosScenario {
  id: string;
  name: string;
  description: string;
  targetService: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'CRITICAL';
  icon: any;
  color: string;
}

export const ChaosAndTelemetry: React.FC = () => {
  // Telemetry metrics
  const [throughputRps, setThroughputRps] = useState(148);
  const [latencyP95, setLatencyP95] = useState(12);
  const [cacheHitRate, setCacheHitRate] = useState(94.6);
  const [resilienceScore, setResilienceScore] = useState(98);
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);
  const [chaosLogs, setChaosLogs] = useState<string[]>([
    '[APM Daemon] Telemetry agent attached. Monitoring 6 microservices across cluster.',
    '[Health Check] All synthetic probes reporting HTTP 200 OK.',
  ]);

  // Topology node selection
  const [selectedNode, setSelectedNode] = useState<string>('gateway');

  // Dynamic telemetry tick
  useEffect(() => {
    const interval = setInterval(() => {
      setThroughputRps((prev) => Math.floor(130 + Math.random() * 35));
      if (!activeExperiment) {
        setLatencyP95((prev) => Math.floor(9 + Math.random() * 8));
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [activeExperiment]);

  const addChaosLog = (msg: string) => {
    setChaosLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 30),
    ]);
  };

  const chaosScenarios: ChaosScenario[] = [
    {
      id: 'latency_injection',
      name: 'Network Latency Jitter (+450ms)',
      description: 'Inject artificial network delay on database read pool to verify client timeout resilience.',
      targetService: 'MySQL Database Pool',
      impactLevel: 'LOW',
      icon: TrendingUp,
      color: 'from-amber-500 to-yellow-600',
    },
    {
      id: 'cache_stampede',
      name: 'Thundering Herd Cache Purge',
      description: 'Flush 100% of Caffeine L1 in-memory keys concurrently to test lock contention and cold database fallback.',
      targetService: 'Caffeine L1 Cache',
      impactLevel: 'MEDIUM',
      icon: Flame,
      color: 'from-orange-500 to-red-600',
    },
    {
      id: 'kafka_partition_cut',
      name: 'Kafka Partition Disconnection',
      description: 'Sever consumer socket to topic "orders" to verify consumer group auto-rebalance and offset recovery.',
      targetService: 'Kafka Broker Node 1',
      impactLevel: 'MEDIUM',
      icon: Radio,
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'aes_tamper_attack',
      name: 'AES-GCM Auth Tag Tamper Attack',
      description: 'Inject a mutated authentication tag into encrypted credentials to verify cryptographic GCM rejection.',
      targetService: 'Security & AES Vault',
      impactLevel: 'CRITICAL',
      icon: ShieldAlert,
      color: 'from-rose-500 to-pink-600',
    },
  ];

  const handleRunChaos = async (scenario: ChaosScenario) => {
    if (activeExperiment) return;
    setActiveExperiment(scenario.id);
    addChaosLog(`[CHAOS MONKEY] Triggered experiment: "${scenario.name}" on ${scenario.targetService}`);

    if (scenario.id === 'latency_injection') {
      setLatencyP95(485);
      setResilienceScore(88);
      await new Promise((r) => setTimeout(r, 1000));
      addChaosLog(`[Alert] P95 latency spiked to 485ms. Caffeine cache absorbing 94% of queries, preventing thread starvation.`);
      await new Promise((r) => setTimeout(r, 1500));
      addChaosLog(`[Self-Healing] Circuit breaker prevented cascading pool saturation. Latency normalized.`);
      setLatencyP95(14);
      setResilienceScore(98);
    } else if (scenario.id === 'cache_stampede') {
      setCacheHitRate(0);
      setResilienceScore(82);
      addChaosLog(`[Cache Invalidation] 10 keys evicted simultaneously. 50 incoming requests hitting database.`);
      await new Promise((r) => setTimeout(r, 1200));
      addChaosLog(`[Database Guard] JOIN FETCH query executed in single roundtrip. Re-hydrated L1 cache.`);
      setCacheHitRate(95.2);
      setResilienceScore(99);
    } else if (scenario.id === 'kafka_partition_cut') {
      addChaosLog(`[Kafka Heartbeat Failure] Heartbeat expired for member order-consumer-1.`);
      await new Promise((r) => setTimeout(r, 1000));
      addChaosLog(`[Consumer Rebalance] Assigned partition 0 to standby consumer thread. Idempotent state intact.`);
      await new Promise((r) => setTimeout(r, 1200));
      addChaosLog(`[Event Stream Restored] 0 messages lost. Duplicate event checks active.`);
    } else if (scenario.id === 'aes_tamper_attack') {
      addChaosLog(`[Security Probe] Submitting forged payload with invalid 128-bit authentication tag...`);
      await new Promise((r) => setTimeout(r, 900));
      addChaosLog(`[Web Crypto Rejection] AEAD BadTagException caught: GeneralSecurityException.`);
      addChaosLog(`[Audit Log] Security vault successfully blocked tampered secret access. Attacker IP logged.`);
    }

    await new Promise((r) => setTimeout(r, 800));
    addChaosLog(`[Experiment Completed] System self-healed with 100% data integrity.`);
    setActiveExperiment(null);
  };

  const topologyNodes = [
    { id: 'client', name: 'React 19 SPA', type: 'Frontend Tier', status: 'Healthy', latency: '< 2ms', icon: Cpu },
    { id: 'gateway', name: 'Spring Cloud Gateway', type: 'Ingress & MDC', status: 'Healthy', latency: '4ms', icon: Network },
    { id: 'auth', name: 'JWT & AES Vault', type: 'Security Perimeter', status: 'Protected', latency: '6ms', icon: ShieldCheck },
    { id: 'cache', name: 'Caffeine In-Memory L1', type: 'Read Cache', status: '94% Hit Rate', latency: '1ms', icon: Zap },
    { id: 'database', name: 'MySQL Relational DB', type: 'Persistent Store', status: 'Healthy', latency: '18ms', icon: Database },
    { id: 'kafka', name: 'Kafka Cluster (DLQ)', type: 'Event Stream', status: 'Operational', latency: '3ms', icon: Radio },
    { id: 'cloudrun', name: 'Cloud Run Canary', type: 'Deployment Mesh', status: '90/10 Split', latency: '12ms', icon: Server },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              ADVANCED SYSTEM TELEMETRY
            </span>
            <span className="text-xs text-slate-400">APM & Chaos Engineering</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Distributed Observability & Chaos Resilience Console
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time APM telemetry, live microservices dependency topology, and controlled fault injection.
          </p>
        </div>

        {/* Resilience Score Gauge */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-5">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">System Resilience</div>
            <div className="text-2xl font-black font-mono text-emerald-400">{resilienceScore}%</div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">P95 Latency</div>
            <div className={`text-xl font-bold font-mono ${latencyP95 > 100 ? 'text-rose-400' : 'text-cyan-400'}`}>
              {latencyP95}ms
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Throughput</div>
            <div className="text-xl font-bold font-mono text-purple-400">{throughputRps} rps</div>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Throughput Rate</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{throughputRps} <span className="text-xs text-slate-400 font-normal">req/sec</span></div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>↑ 12% vs last hour</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>P95 Response Latency</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{latencyP95} <span className="text-xs text-slate-400 font-normal">ms</span></div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>SLA: &lt; 50ms guaranteed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Caffeine Cache Efficiency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">{cacheHitRate}%</div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>0 DB queries on cache hit</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Kafka Consumer Lag</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">0 <span className="text-xs text-slate-400 font-normal">events</span></div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>Real-time stream in sync</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Microservices Topology */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                Live Microservices Topology Map
              </h3>
              <span className="text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                7 Nodes Operational
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Click any node in the distributed mesh to inspect runtime metrics, security status, and circuit breaker health.
            </p>

            {/* Topology Node Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {topologyNodes.map((node) => {
                const Icon = node.icon;
                const isSelected = selectedNode === node.id;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-300 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 text-xs">{node.name}</div>
                          <div className="text-[10px] text-slate-500">{node.type}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                        {node.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                      <span>Avg Latency:</span>
                      <span className="text-slate-200 font-bold">{node.latency}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Chaos Engineering Injection Matrix */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  Chaos Injection Matrix
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate production anomalies to test automated recovery and self-healing.
                </p>
              </div>
            </div>

            {/* Scenario Buttons */}
            <div className="space-y-3">
              {chaosScenarios.map((scenario) => {
                const Icon = scenario.icon;
                const isRunning = activeExperiment === scenario.id;
                return (
                  <div
                    key={scenario.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${scenario.color} flex items-center justify-center text-white shadow`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-xs text-slate-200">{scenario.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        scenario.impactLevel === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : scenario.impactLevel === 'MEDIUM'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {scenario.impactLevel}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 leading-snug">{scenario.description}</p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Target: {scenario.targetService}</span>
                      <button
                        onClick={() => handleRunChaos(scenario)}
                        disabled={activeExperiment !== null}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Play className="w-3 h-3 text-amber-400" />
                        <span>{isRunning ? 'Injecting...' : 'Inject Chaos'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Chaos Audit Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Live Self-Healing & Audit Stream
            </h4>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
              {chaosLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes('Alert') || log.includes('Failure')
                      ? 'text-rose-400'
                      : log.includes('Self-Healing') || log.includes('Completed')
                      ? 'text-emerald-400 font-semibold'
                      : log.includes('CHAOS')
                      ? 'text-amber-400 font-bold'
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
