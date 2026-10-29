import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Database, 
  Radio, 
  GitBranch, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Lock, 
  Zap, 
  Server, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface ArchitectureOverviewProps {
  onSelectTab: (tab: string) => void;
}

export const ArchitectureOverview: React.FC<ArchitectureOverviewProps> = ({ onSelectTab }) => {
  const experimentPillars = [
    {
      exp: 'Exp 1 & 2',
      title: 'Frontend State & Reselect Optimization',
      category: 'Client Core',
      icon: Cpu,
      color: 'from-blue-500 to-cyan-500',
      border: 'border-blue-500/30',
      tab: 'composer',
      concepts: [
        'Multi-platform constraint validation (Twitter 280, LinkedIn 3000, Instagram 2200)',
        'Draft management lifecycle with localStorage synchronization (Exp 1.2)',
        'Redux Toolkit centralized store (configureStore, createSlice, dispatch actions) (Exp 2.1)',
        'createSelector memoization for zero redundant recomputations (Exp 2.2)',
      ],
      tech: ['React 19', 'Redux Toolkit', 'Reselect', 'LocalStorage'],
    },
    {
      exp: 'Exp 3 & 7',
      title: 'Zero-Trust JWT, RBAC & AES-256 Vault',
      category: 'Security & Identity',
      icon: Lock,
      color: 'from-purple-500 to-pink-500',
      border: 'border-purple-500/30',
      tab: 'auth_vault',
      concepts: [
        'Stateless JWT authentication (Header, Claims payload, HMAC verification) (Exp 3.1)',
        'Role-Based Access Control (Admin, Editor, Viewer) with protected routes (Exp 3.2)',
        'Spring Security OncePerRequestFilter & BCrypt password hashing (Exp 7.1)',
        'AES-256-GCM symmetric credential encryption with 12-byte IV nonce (Exp 7.2)',
        'Refresh Token rotation with SHA-256 hash storage & pessimistic locks (Exp 7.2)',
      ],
      tech: ['JWT (RFC 7519)', 'Web Crypto AES-GCM', 'Spring Security', 'BCrypt'],
    },
    {
      exp: 'Exp 5 & 6',
      title: 'Layered REST, Caching & Relational Querying',
      category: 'Backend & Data',
      icon: Server,
      color: 'from-emerald-500 to-teal-500',
      border: 'border-emerald-500/30',
      tab: 'rest_cache',
      concepts: [
        'Controller -> Service -> Repository layered REST architecture with Bean Validation (Exp 5.1)',
        'Global exception handling (@ControllerAdvice) and MDC correlation ID tracing (Exp 5.2)',
        'Spring Data Pageable sorting and pagination with PageResponse<T> (Exp 6.1)',
        'Caffeine in-memory L1 cache with TTL and LRU evictions (Exp 6.2)',
        'Relational JOIN FETCH query optimization eliminating the N+1 problem (Exp 6.2)',
      ],
      tech: ['Spring Data JPA', 'Caffeine Cache', 'MDC Logging', 'MySQL/PostgreSQL'],
    },
    {
      exp: 'Exp 8',
      title: 'Event-Driven Kafka Reliability & DLQ',
      category: 'Async Streaming',
      icon: Radio,
      color: 'from-amber-500 to-orange-500',
      border: 'border-amber-500/30',
      tab: 'kafka_dlq',
      concepts: [
        'Decoupled order and post message publishing via Apache Kafka topics (Exp 8.1)',
        'Idempotent event processing via atomic processed_events deduplication (Exp 8.1)',
        'Exponential backoff retry policy (1s -> 2s -> 4s, 3 attempts) (Exp 8.2)',
        'Dead Letter Topic (orders.DLT) routing for failed events with replay audit (Exp 8.2)',
        'Event tracking state machine (PUBLISHING -> PUBLISHED -> PROCESSED/DLT) (Exp 8.2)',
      ],
      tech: ['Apache Kafka', 'Spring Kafka', 'Exponential Backoff', 'Dead Letter Queue'],
    },
    {
      exp: 'Exp 9',
      title: 'Automated CI/CD & Cloud Run Canary',
      category: 'DevOps & Reliability',
      icon: GitBranch,
      color: 'from-rose-500 to-red-500',
      border: 'border-rose-500/30',
      tab: 'cicd_canary',
      concepts: [
        'Multi-layer testing: JUnit 5 unit tests, Mockito service mocks, MockMvc (Exp 9.1)',
        'Real infrastructure testing via MySQL Testcontainers (Exp 9.1)',
        'Consumer-driven contract verification using Pact (Exp 9.1)',
        'Multi-stage Docker packaging (Java 21 build -> JRE runtime) (Exp 9.2)',
        'Cloud Run Canary deployment: 10% canary traffic shifting, smoke checks & rollback (Exp 9.2)',
      ],
      tech: ['GitHub Actions', 'Testcontainers', 'Pact', 'Docker', 'Google Cloud Run'],
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>StreamLine Architecture • Master Capstone</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            StreamLine: Unified Enterprise Distributed Platform
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed max-w-3xl">
            A production-grade cloud-native microservices architecture synthesizing all core disciplines from <strong className="text-white">Experiments 1 through 9</strong>. Seamlessly orchestrating multi-platform content authoring, normalized Redux state, zero-trust cryptographic security, high-performance database caching, resilient Kafka event streaming, and automated canary deployments.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectTab('lab_report')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>View Experiment 10 Lab Report</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectTab('composer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
            >
              <span>Launch Live System Demo</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* End-to-End Architectural Pipeline Flow Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Unified Data & Event Flow Architecture
            </h2>
            <p className="text-xs text-slate-400">
              Interactive pipeline topology tracing a request from browser client down to Kafka stream and Cloud Run canary
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700">
            Microservices Mesh v10.0
          </span>
        </div>

        {/* Visual Pipeline Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Step 1 */}
          <div 
            onClick={() => onSelectTab('composer')}
            className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-indigo-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="text-[10px] font-mono text-cyan-400 font-semibold mb-1">TIER 1 • EXP 1 & 2</div>
            <div className="font-bold text-slate-200 text-sm group-hover:text-cyan-300 flex items-center justify-between">
              <span>Post Composer</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-platform limit checks, LocalStorage drafts, and Redux Toolkit with Reselect memoization.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">Reselect</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Redux</span>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => onSelectTab('auth_vault')}
            className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-purple-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="text-[10px] font-mono text-purple-400 font-semibold mb-1">TIER 2 • EXP 3 & 7</div>
            <div className="font-bold text-slate-200 text-sm group-hover:text-purple-300 flex items-center justify-between">
              <span>Auth & AES Vault</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Stateless JWT + RBAC, rotating refresh tokens, and AES-GCM credential encryption for 3P APIs.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">AES-GCM</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">JWT RBAC</span>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => onSelectTab('rest_cache')}
            className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-emerald-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="text-[10px] font-mono text-emerald-400 font-semibold mb-1">TIER 3 • EXP 5 & 6</div>
            <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 flex items-center justify-between">
              <span>REST & Caching</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              MDC Correlation tracking, Spring Pageable sorting, Caffeine L1 cache, and JOIN FETCH optimization.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Caffeine L1</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">MDC ID</span>
            </div>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => onSelectTab('kafka_dlq')}
            className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-amber-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="text-[10px] font-mono text-amber-400 font-semibold mb-1">TIER 4 • EXP 8</div>
            <div className="font-bold text-slate-200 text-sm group-hover:text-amber-300 flex items-center justify-between">
              <span>Kafka Resilience</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Atomic event idempotency, exponential backoff retries (1s, 2s, 4s), and orders.DLT isolation.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] bg-amber-950/60 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">Kafka DLQ</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Idempotent</span>
            </div>
          </div>

          {/* Step 5 */}
          <div 
            onClick={() => onSelectTab('cicd_canary')}
            className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 p-4 rounded-xl border border-slate-700/60 hover:border-rose-500/50 transition-all hover:scale-[1.02]"
          >
            <div className="text-[10px] font-mono text-rose-400 font-semibold mb-1">TIER 5 • EXP 9</div>
            <div className="font-bold text-slate-200 text-sm group-hover:text-rose-300 flex items-center justify-between">
              <span>Canary CI/CD</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-transform group-hover:translate-x-1" />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              JUnit 5 + MockMvc + Pact contract suites, Docker multi-stage images, and Cloud Run 10% canary traffic.
            </p>
            <div className="mt-3 flex flex-wrap gap-1">
              <span className="text-[10px] bg-rose-950/60 text-rose-300 border border-rose-800 px-1.5 py-0.5 rounded">Canary 10%</span>
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">Pact Tests</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 5 Synthesized Lab Pillars */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>Deconstruction of Experiment 10 into Previous Lab Experiments</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experimentPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.exp}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                      {pillar.exp}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{pillar.category}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shadow`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-slate-100 text-base">{pillar.title}</h3>
                  </div>

                  <ul className="space-y-2 mt-4">
                    {pillar.concepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-snug">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {pillar.tech.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onSelectTab(pillar.tab)}
                    className="p-1.5 rounded-lg hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 transition"
                    title="Open Module"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
