import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ArrowRight, 
  Terminal, 
  Server, 
  Zap, 
  Layers, 
  Clock, 
  ShieldCheck,
  Percent
} from 'lucide-react';
import { CanaryDeploymentState, CiTestResult } from '../types';
import { INITIAL_CANARY_STATE, INITIAL_CI_TESTS } from '../services/ciCdService';

export const CanaryCiCdPipeline: React.FC = () => {
  const [tests, setTests] = useState<CiTestResult[]>(INITIAL_CI_TESTS);
  const [isRunningCi, setIsRunningCi] = useState(false);
  const [canaryState, setCanaryState] = useState<CanaryDeploymentState>(INITIAL_CANARY_STATE);
  const [isDeploying, setIsDeploying] = useState(false);

  // Run CI Test Suite (Exp 9.1)
  const handleRunCi = async () => {
    setIsRunningCi(true);
    // Mark tests as pending
    setTests((prev) => prev.map((t) => ({ ...t, status: 'PENDING' })));

    for (let i = 0; i < tests.length; i++) {
      setTests((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'RUNNING' } : t))
      );
      await new Promise((r) => setTimeout(r, 260));
      setTests((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'PASSED' } : t))
      );
    }
    setIsRunningCi(false);
  };

  // Canary Release Lifecycle (Exp 9.2)
  const handleDeployCanary = async (simulateFault = false) => {
    setIsDeploying(true);
    const newSha = Math.random().toString(36).substring(2, 9);
    const canaryTag = `srv-rev-10-canary-${newSha}`;

    setCanaryState((prev) => ({
      ...prev,
      canaryRevision: canaryTag,
      lastDeployedSha: newSha,
      stage: 'BUILDING',
      smokeTestResult: 'PENDING',
      logs: [
        `[GitHub Actions #ci.yml] Commit ${newSha} detected on branch 'main'. Starting multi-stage Docker build...`,
        `[Docker Build] Layer 1: maven-build package ci-pipeline-0.0.1-SNAPSHOT.jar...`,
        `[Docker Build] Layer 2: eclipse-temurin:21-jre runtime image published to Artifact Registry.`,
      ],
    }));

    await new Promise((r) => setTimeout(r, 1000));

    // Stage 2: Deploy Canary Revision without production traffic (0% traffic)
    setCanaryState((prev) => ({
      ...prev,
      stage: 'DEPLOYING_CANARY',
      logs: [
        ...prev.logs,
        `[Cloud Run API] gcloud run deploy cu-fullstack-service --image=asia-docker.pkg.dev/.../ci-pipeline:${newSha} --no-traffic --tag=canary-${newSha}`,
        `[Cloud Run API] Revision ${canaryTag} provisioned successfully with dedicated URL: https://${canaryTag}.a.run.app`,
      ],
    }));

    await new Promise((r) => setTimeout(r, 900));

    // Stage 3: Shift 10% traffic to Canary (Exp 9.2)
    setCanaryState((prev) => ({
      ...prev,
      stage: 'TRAFFIC_SPLIT_10',
      stableTrafficPercent: 90,
      canaryTrafficPercent: 10,
      logs: [
        ...prev.logs,
        `[Traffic Splitting] gcloud run services update-traffic cu-fullstack-service --to-revisions=${prev.currentStableRevision}=90,${canaryTag}=10`,
        `[Traffic Splitting] 10% live user traffic shifted to canary revision for synthetic smoke testing.`,
      ],
    }));

    await new Promise((r) => setTimeout(r, 1200));

    // Stage 4: Smoke Test (Exp 9.2)
    if (simulateFault) {
      setCanaryState((prev) => ({
        ...prev,
        stage: 'ROLLED_BACK',
        stableTrafficPercent: 100,
        canaryTrafficPercent: 0,
        smokeTestResult: 'FAILURE',
        logs: [
          ...prev.logs,
          `[Smoke Test] curl --fail --retry 6 https://${canaryTag}.a.run.app/ returned HTTP 500 error!`,
          `[Automated Safety Rollback] Health check failure detected in canary window!`,
          `[Automated Safety Rollback] gcloud run services update-traffic cu-fullstack-service --to-revisions=${prev.currentStableRevision}=100`,
          `[Rollback Complete] 100% traffic immediately restored to stable revision ${prev.currentStableRevision}. Zero user downtime.`,
        ],
      }));
    } else {
      setCanaryState((prev) => ({
        ...prev,
        stage: 'PROMOTED_100',
        currentStableRevision: canaryTag,
        stableTrafficPercent: 100,
        canaryTrafficPercent: 0,
        smokeTestResult: 'SUCCESS',
        logs: [
          ...prev.logs,
          `[Smoke Test] curl --fail --retry 6 https://${canaryTag}.a.run.app/ returned HTTP 200 OK across 6 probe attempts.`,
          `[Promotion Gate] Canary validation passed! Promoting revision ${canaryTag} to 100% production traffic.`,
          `[Promote to 100%] gcloud run services update-traffic cu-fullstack-service --to-revisions=${canaryTag}=100`,
          `[Release Live] Revision ${canaryTag} is now the active stable deployment.`,
        ],
      }));
    }

    setIsDeploying(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-semibold">
              EXPERIMENTS 9.1 & 9.2
            </span>
            <span className="text-xs text-slate-400">Synthesis Module 5</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Automated CI/CD Pipeline & Cloud Run Canary Deployment
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            JUnit 5, MockMvc, and Pact contract testing gates paired with Google Cloud Run 10% canary traffic splitting and instant rollback.
          </p>
        </div>

        {/* Live Traffic Split Status */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-4">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Stable Traffic</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {canaryState.stableTrafficPercent}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Canary Traffic</div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {canaryState.canaryTrafficPercent}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: CI Testing Pipeline (Exp 9.1) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Continuous Integration Quality Gate (Exp 9.1)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automated maven verification: JUnit 5 unit tests, MockMvc Testcontainers, and Pact contracts.
                </p>
              </div>
              <button
                onClick={handleRunCi}
                disabled={isRunningCi}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isRunningCi ? 'Running Suite...' : 'Run CI Tests'}</span>
              </button>
            </div>

            {/* Test Cards List */}
            <div className="space-y-2.5">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        test.type === 'UNIT'
                          ? 'bg-blue-950 text-blue-300 border border-blue-900'
                          : test.type === 'INTEGRATION'
                          ? 'bg-purple-950 text-purple-300 border border-purple-900'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                      }`}>
                        {test.type}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-200 truncate">
                        {test.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{test.details}</p>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">
                      {test.assertions} assertions passed in {test.durationMs}ms
                    </div>
                  </div>

                  <div>
                    {test.status === 'PASSED' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> PASSED
                      </span>
                    ) : test.status === 'RUNNING' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 animate-pulse">
                        <Clock className="w-4 h-4" /> TESTING...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cloud Run Canary Deployment Controller (Exp 9.2) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-rose-400" />
                  Cloud Run Canary Orchestration (Exp 9.2)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gradual release with 10% canary traffic shifting, smoke testing, and automated rollback.
                </p>
              </div>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                canaryState.stage === 'PROMOTED_100'
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : canaryState.stage === 'ROLLED_BACK'
                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                  : canaryState.stage === 'TRAFFIC_SPLIT_10'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {canaryState.stage}
              </span>
            </div>

            {/* Visual Traffic Bar */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Production Traffic Distribution</span>
                <span className="font-mono text-[11px] text-slate-400">
                  Stable: {canaryState.stableTrafficPercent}% | Canary: {canaryState.canaryTrafficPercent}%
                </span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-800 flex overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ width: `${canaryState.stableTrafficPercent}%` }}
                >
                  {canaryState.stableTrafficPercent > 15 ? `${canaryState.stableTrafficPercent}% Stable` : ''}
                </div>
                <div
                  className="h-full bg-amber-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-950"
                  style={{ width: `${canaryState.canaryTrafficPercent}%` }}
                >
                  {canaryState.canaryTrafficPercent > 5 ? `${canaryState.canaryTrafficPercent}% Canary` : ''}
                </div>
              </div>
            </div>

            {/* Canary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleDeployCanary(false)}
                disabled={isDeploying}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Zap className="w-4 h-4" />
                <span>Deploy Canary (Healthy → 100%)</span>
              </button>

              <button
                onClick={() => handleDeployCanary(true)}
                disabled={isDeploying}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Simulate Canary Error (Rollback)</span>
              </button>
            </div>

            {/* Cloud Run Service Telemetry Details */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] block">SERVING STABLE REVISION</span>
                <span className="text-emerald-400 font-bold truncate block">{canaryState.currentStableRevision}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">TEST CANARY REVISION</span>
                <span className="text-amber-400 font-bold truncate block">{canaryState.canaryRevision}</span>
              </div>
            </div>

            {/* Deployment & Traffic Shift Log Stream */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
                  <Terminal className="w-3.5 h-3.5 text-rose-400" />
                  GCloud Run & GitHub Actions Log Stream
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
                {canaryState.logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('Rollback') || log.includes('error')
                        ? 'text-rose-400 font-semibold'
                        : log.includes('Promoted') || log.includes('promoted') || log.includes('HTTP 200')
                        ? 'text-emerald-400 font-semibold'
                        : log.includes('Traffic Splitting')
                        ? 'text-amber-300'
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
    </div>
  );
};
