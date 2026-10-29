import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Database, 
  GitBranch, 
  FileText, 
  Share2, 
  Radio, 
  Activity,
  Flame,
  Zap,
  Globe
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUserRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  tokenExpiresIn: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUserRole,
  onRoleChange,
  tokenExpiresIn,
}) => {
  const tabs = [
    { id: 'overview', label: 'Architecture Matrix', icon: Layers },
    { id: 'composer', label: 'Content Composer', icon: Share2 },
    { id: 'auth_vault', label: 'Security & Vault', icon: ShieldCheck },
    { id: 'rest_cache', label: 'REST & Caching', icon: Database },
    { id: 'kafka_dlq', label: 'Kafka Event Stream', icon: Radio },
    { id: 'cicd_canary', label: 'CI/CD & Canary', icon: GitBranch },
    { id: 'chaos', label: 'Observability & Chaos', icon: Flame, isNew: true },
    { id: 'lab_report', label: 'Documentation & Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Valid Project Name */}
          <div 
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">StreamLine</span>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Cloud Native
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[280px] sm:max-w-none">
                Enterprise Distributed Content & Event Platform
              </p>
            </div>
          </div>

          {/* Right Action Bar: System Health, Live Telemetry & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Live Mesh Health Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-medium font-mono text-[11px]">99.98% Mesh Healthy</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-mono text-[11px]">JWT {Math.max(0, tokenExpiresIn)}m</span>
            </div>

            {/* Quick Chaos & Telemetry Trigger */}
            <button
              onClick={() => setActiveTab('chaos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
                activeTab === 'chaos'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Telemetry & Chaos</span>
              <span className="sm:hidden">Chaos</span>
            </button>

            {/* Role Gate Switcher */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1 text-xs">
              <span className="px-2 text-slate-400 font-medium hidden sm:inline">Role:</span>
              {(['ADMIN', 'EDITOR', 'VIEWER'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`px-2.5 py-1 rounded font-semibold transition-all ${
                    currentUserRole === role
                      ? role === 'ADMIN'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : role === 'EDITOR'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isNew && (
                  <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded uppercase">
                    New
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
