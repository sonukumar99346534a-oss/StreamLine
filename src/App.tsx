/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useReducer } from 'react';
import { Navbar } from './components/Navbar';
import { ArchitectureOverview } from './components/ArchitectureOverview';
import { ComposerAndRedux } from './components/ComposerAndRedux';
import { AuthAndSecurityVault } from './components/AuthAndSecurityVault';
import { ApiAndCachingEngine } from './components/ApiAndCachingEngine';
import { KafkaReliabilityDLQ } from './components/KafkaReliabilityDLQ';
import { CanaryCiCdPipeline } from './components/CanaryCiCdPipeline';
import { ChaosAndTelemetry } from './components/ChaosAndTelemetry';
import { LabReportView } from './components/LabReportView';
import { User, UserRole } from './types';
import { 
  createJwtToken, 
  generateRandomRefreshToken 
} from './services/cryptoService';
import { 
  loadInitialState, 
  saveStateToStorage, 
  PostsState,
  MemoizedSelectorTracker 
} from './services/storeService';

const INITIAL_USER: User = {
  id: '24BAI70827',
  username: 'kanishk_jamwal',
  name: 'Kanishk Jamwal',
  email: '24bai70827@cuchd.in',
  role: 'ADMIN',
};

// Redux reducer implementation (Exp 2.1)
function postsReducer(state: PostsState, action: { type: string; payload?: any }): PostsState {
  let updatedState = state;
  const logEntry = {
    id: Math.random().toString(36).substring(2, 9),
    type: action.type,
    timestamp: Date.now(),
    payloadPreview: action.payload ? JSON.stringify(action.payload).substring(0, 40) + '...' : 'none',
  };

  switch (action.type) {
    case 'posts/addPost': {
      const items = [action.payload, ...state.items];
      updatedState = {
        ...state,
        items,
        actionLog: [logEntry, ...state.actionLog.slice(0, 25)],
      };
      saveStateToStorage(items, state.drafts);
      break;
    }
    case 'posts/updatePost': {
      const items = state.items.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      updatedState = {
        ...state,
        items,
        actionLog: [logEntry, ...state.actionLog.slice(0, 25)],
      };
      saveStateToStorage(items, state.drafts);
      break;
    }
    case 'posts/deletePost': {
      const items = state.items.filter((p) => p.id !== action.payload);
      updatedState = {
        ...state,
        items,
        actionLog: [logEntry, ...state.actionLog.slice(0, 25)],
      };
      saveStateToStorage(items, state.drafts);
      break;
    }
    case 'posts/setSearchQuery': {
      updatedState = {
        ...state,
        searchQuery: action.payload,
      };
      break;
    }
    case 'posts/setActiveFilter': {
      updatedState = {
        ...state,
        activeFilter: action.payload,
      };
      break;
    }
    case 'drafts/saveDraft': {
      const drafts = [action.payload, ...state.drafts];
      updatedState = {
        ...state,
        drafts,
        actionLog: [logEntry, ...state.actionLog.slice(0, 25)],
      };
      saveStateToStorage(state.items, drafts);
      break;
    }
    case 'drafts/deleteDraft': {
      const drafts = state.drafts.filter((d) => d.id !== action.payload);
      updatedState = {
        ...state,
        drafts,
        actionLog: [logEntry, ...state.actionLog.slice(0, 25)],
      };
      saveStateToStorage(state.items, drafts);
      break;
    }
    case 'posts/clearActionLog': {
      updatedState = {
        ...state,
        actionLog: [],
      };
      break;
    }
    default:
      return state;
  }

  return updatedState;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [token, setToken] = useState<string>(() => createJwtToken(INITIAL_USER, 15));
  const [refreshToken, setRefreshToken] = useState<string>(() => generateRandomRefreshToken());
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number>(15);

  // Central Redux Toolkit-like store (Exp 2.1)
  const [storeState, dispatch] = useReducer(postsReducer, undefined, loadInitialState);

  // Token countdown timer (Exp 3.1 & 7.2)
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Role Switcher (Exp 3.2 RBAC)
  const handleRoleChange = (newRole: UserRole) => {
    const updatedUser: User = {
      ...currentUser,
      role: newRole,
      name: newRole === 'ADMIN' ? 'Kanishk Jamwal' : newRole === 'EDITOR' ? 'Hari Krishan' : 'Guest Auditor',
      username: newRole === 'ADMIN' ? '24BAI70827' : newRole === 'EDITOR' ? '24BAI70898' : 'viewer_cu',
    };
    setCurrentUser(updatedUser);
    setToken(createJwtToken(updatedUser, 15));
    setTokenExpiresIn(15);
  };

  // Refresh Token Rotation (Exp 7.2)
  const handleRotateToken = () => {
    const newRefresh = generateRandomRefreshToken();
    const newJwt = createJwtToken(currentUser, 15);
    setRefreshToken(newRefresh);
    setToken(newJwt);
    setTokenExpiresIn(15);
  };

  const handleLogout = () => {
    handleRoleChange('VIEWER');
    handleRotateToken();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUserRole={currentUser.role}
        onRoleChange={handleRoleChange}
        tokenExpiresIn={tokenExpiresIn}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <ArchitectureOverview onSelectTab={setActiveTab} />
        )}

        {activeTab === 'composer' && (
          <ComposerAndRedux
            state={storeState}
            dispatch={dispatch}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'auth_vault' && (
          <AuthAndSecurityVault
            currentUser={currentUser}
            token={token}
            refreshToken={refreshToken}
            onRoleChange={handleRoleChange}
            onRotateToken={handleRotateToken}
          />
        )}

        {activeTab === 'rest_cache' && (
          <ApiAndCachingEngine />
        )}

        {activeTab === 'kafka_dlq' && (
          <KafkaReliabilityDLQ />
        )}

        {activeTab === 'cicd_canary' && (
          <CanaryCiCdPipeline />
        )}

        {activeTab === 'chaos' && (
          <ChaosAndTelemetry />
        )}

        {activeTab === 'lab_report' && (
          <LabReportView />
        )}
      </main>

      {/* Platform Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-500 py-5 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">StreamLine Enterprise</span>
            <span>•</span>
            <span>Distributed Cloud-Native Microservices Platform</span>
          </div>
          <div className="text-center sm:text-right text-slate-400">
            <span>Production Grade Microservices Mesh • v10.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
