import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  FileCode, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert,
  Fingerprint,
  Copy,
  Check
} from 'lucide-react';
import { EncryptedSecretItem, JwtTokenPayload, User, UserRole } from '../types';
import { 
  decryptAesGcm, 
  encryptAesGcm, 
  decodeJwtToken, 
  generateRandomRefreshToken, 
  sha256Hash 
} from '../services/cryptoService';

interface AuthAndSecurityVaultProps {
  currentUser: User;
  token: string;
  refreshToken: string;
  onRoleChange: (role: UserRole) => void;
  onRotateToken: () => void;
}

export const AuthAndSecurityVault: React.FC<AuthAndSecurityVaultProps> = ({
  currentUser,
  token,
  refreshToken,
  onRoleChange,
  onRotateToken,
}) => {
  // Live decoded JWT inspection (Exp 3.1)
  const decoded = decodeJwtToken(token);

  // AES-GCM Vault State (Exp 7.2)
  const [secrets, setSecrets] = useState<EncryptedSecretItem[]>([
    {
      id: 'sec-1',
      provider: 'twitter_api',
      name: 'Twitter Developer API v2 Bearer Token',
      plaintextMasked: 'AAAAAAAAAAAAAAAAAAAAAKj...38fx',
      ciphertext: 'v1:j8F91nL03k2P:k98D2Zlp01aMnv403910...',
      nonce: 'j8F91nL03k2P',
      algorithm: 'AES-GCM-256',
      updatedAt: '2026-10-29 11:42:10',
    },
    {
      id: 'sec-2',
      provider: 'linkedin_oauth',
      name: 'LinkedIn OAuth 2.0 Client Secret',
      plaintextMasked: 'AQ_x98124_LNK_sec...90a1',
      ciphertext: 'v1:4aX99kL1p02M:z71A883kLp20aMc8912...',
      nonce: '4aX99kL1p02M',
      algorithm: 'AES-GCM-256',
      updatedAt: '2026-10-29 11:45:00',
    },
    {
      id: 'sec-3',
      provider: 'kafka_secret',
      name: 'Apache Kafka SASL SCRAM-512 Secret',
      plaintextMasked: 'kafka-prod-pass-9812!@#',
      ciphertext: 'v1:99a1k0Lm22zX:p0291Lk01Mzc871...',
      nonce: '99a1k0Lm22zX',
      algorithm: 'AES-GCM-256',
      updatedAt: '2026-10-29 12:00:15',
    },
  ]);

  const [newSecretName, setNewSecretName] = useState('');
  const [newSecretValue, setNewSecretValue] = useState('');
  const [newSecretProvider, setNewSecretProvider] = useState<'twitter_api' | 'linkedin_oauth' | 'kafka_secret' | 'mysql_pass'>('twitter_api');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [decryptedValues, setDecryptedValues] = useState<Record<string, string>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Refresh token hash preview (Exp 7.2)
  const [refreshTokenHash, setRefreshTokenHash] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

  React.useEffect(() => {
    sha256Hash(refreshToken).then(setRefreshTokenHash);
  }, [refreshToken]);

  // Handle Encrypt & Store (Exp 7.2 AES-GCM)
  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecretName.trim() || !newSecretValue.trim()) return;

    setIsEncrypting(true);
    try {
      const { formatted, nonceB64 } = await encryptAesGcm(newSecretValue);

      const newItem: EncryptedSecretItem = {
        id: 'sec-' + Date.now(),
        provider: newSecretProvider,
        name: newSecretName,
        plaintextMasked: newSecretValue.substring(0, 4) + '••••••••' + newSecretValue.slice(-3),
        ciphertext: formatted,
        nonce: nonceB64,
        algorithm: 'AES-GCM-256',
        updatedAt: new Date().toLocaleString(),
      };

      setSecrets([newItem, ...secrets]);
      setNewSecretName('');
      setNewSecretValue('');
    } catch (err) {
      console.error('Encryption failed:', err);
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle live Decrypt (Exp 7.2)
  const handleToggleDecrypt = async (id: string, ciphertext: string) => {
    if (decryptedValues[id]) {
      const updated = { ...decryptedValues };
      delete updated[id];
      setDecryptedValues(updated);
      return;
    }

    try {
      const decrypted = await decryptAesGcm(ciphertext);
      setDecryptedValues((prev) => ({ ...prev, [id]: decrypted }));
    } catch (err: any) {
      alert('Decryption Error: ' + err.message);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // RBAC Permission Checker (Exp 3.2)
  const canAccessAdmin = currentUser.role === 'ADMIN';
  const canAccessEditor = currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-semibold">
              EXPERIMENTS 3.1, 3.2, 7.1 & 7.2
            </span>
            <span className="text-xs text-slate-400">Synthesis Module 2</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Zero-Trust JWT Authentication & AES-256-GCM Vault
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Role-Based Access Control, token decoding, refresh token rotation, and hardware-grade credential encryption.
          </p>
        </div>

        {/* Current Role Badge */}
        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Current Session Role</div>
            <div className={`text-base font-bold font-mono ${
              currentUser.role === 'ADMIN' ? 'text-rose-400' : currentUser.role === 'EDITOR' ? 'text-amber-400' : 'text-blue-400'
            }`}>
              {currentUser.role}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <button
            onClick={onRotateToken}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Rotate Token</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: JWT Token Inspector (Exp 3.1 & 7.1) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-indigo-400" />
                Stateless JWT Token Inspector (RFC 7519)
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                HS256 Verified
              </span>
            </div>

            {/* Raw Bearer Token String */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Authorization: Bearer &lt;token&gt;</span>
                <button
                  onClick={() => copyToClipboard(token, 'token')}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                >
                  {copiedField === 'token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] break-all leading-relaxed">
                <span className="text-rose-400">{token.split('.')[0]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-purple-400">{token.split('.')[1]}</span>
                <span className="text-slate-500">.</span>
                <span className="text-cyan-400">{token.split('.')[2]}</span>
              </div>
            </div>

            {/* Decoded Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {/* Header */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-900/30">
                <div className="text-[10px] font-mono text-rose-400 uppercase font-bold mb-1">
                  1. Header (Algorithm & Token Type)
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>

              {/* Claims Payload */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-purple-900/30">
                <div className="text-[10px] font-mono text-purple-400 uppercase font-bold mb-1">
                  2. Payload Claims (Subject & Role)
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
            </div>

            {/* Refresh Token Rotation Card (Exp 7.2) */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  Refresh Token Rotation (Exp 7.2 Pessimistic Lock)
                </span>
                <span className="text-[10px] font-mono text-slate-400">TTL: 7 Days</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono break-all">
                Raw Token: <span className="text-slate-300">{refreshToken}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono break-all">
                Stored SHA-256 Hash: <span className="text-emerald-400">{refreshTokenHash}</span>
              </div>
              <p className="text-[10px] text-slate-500">
                Only the SHA-256 hash is persisted in MySQL table <code className="text-slate-400">refresh_tokens</code>. Upon rotation, the old token is marked revoked and a replacement is atomically issued.
              </p>
            </div>
          </div>

          {/* RBAC Route Permissions Matrix (Exp 3.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Role-Based Access Control (RBAC) Gate
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Simulating Spring Security <code className="text-indigo-300">@PreAuthorize("hasRole('ADMIN')")</code> and React Router protected navigation.
            </p>

            <div className="space-y-2.5">
              {/* Route 1: Admin Console */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                canAccessAdmin 
                  ? 'bg-rose-950/20 border-rose-500/40 text-slate-200' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>Route: /api/admin/** (User Directory & Master Purge)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-300">
                      ADMIN ONLY
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Delete system users, inspect audit logs, and write to AES-256 vault.
                  </div>
                </div>
                <div>
                  {canAccessAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Granted (200 OK)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                      <ShieldAlert className="w-4 h-4" /> 403 Forbidden
                    </span>
                  )}
                </div>
              </div>

              {/* Route 2: Editor Pipeline */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                canAccessEditor 
                  ? 'bg-amber-950/20 border-amber-500/40 text-slate-200' 
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>Route: /api/posts/** (Publish & Dispatch Kafka Events)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300">
                      ADMIN + EDITOR
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Author posts, trigger event streaming, and view catalog analytics.
                  </div>
                </div>
                <div>
                  {canAccessEditor ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" /> Granted (200 OK)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500">
                      <ShieldAlert className="w-4 h-4" /> 403 Forbidden
                    </span>
                  )}
                </div>
              </div>

              {/* Route 3: Viewer Dashboard */}
              <div className="p-3 rounded-xl border bg-indigo-950/20 border-indigo-500/40 text-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span>Route: /api/catalog/** (Public Read & Cache Exploration)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-900/60 text-indigo-300">
                      ALL ROLES
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Read paginated products, test Caffeine cache hits, and search posts.
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Granted (200 OK)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AES-256-GCM Credential Vault (Exp 7.2) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-pink-400" />
                  AES-256-GCM Secure Credential Vault (Exp 7.2)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sensitive credentials encrypted with 12-byte IV nonce and 128-bit authentication tag.
                </p>
              </div>
              <span className="text-xs font-mono bg-pink-950 text-pink-300 border border-pink-800 px-2 py-0.5 rounded">
                GCM/NoPadding
              </span>
            </div>

            {/* Add New Credential Form (Admin only) */}
            <form onSubmit={handleAddSecret} className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  Encrypt & Store 3P Secret
                </span>
                {!canAccessAdmin && (
                  <span className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" /> Requires ADMIN role to encrypt
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  disabled={!canAccessAdmin}
                  value={newSecretProvider}
                  onChange={(e: any) => setNewSecretProvider(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="twitter_api">Twitter API Secret</option>
                  <option value="linkedin_oauth">LinkedIn OAuth Secret</option>
                  <option value="kafka_secret">Apache Kafka Key</option>
                  <option value="mysql_pass">MySQL Root Password</option>
                </select>

                <input
                  type="text"
                  disabled={!canAccessAdmin}
                  placeholder="Credential Label (e.g. Prod Twitter Bot)"
                  value={newSecretName}
                  onChange={(e) => setNewSecretName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  disabled={!canAccessAdmin}
                  placeholder="Enter Plaintext Secret to encrypt (e.g. sk_live_89124...)"
                  value={newSecretValue}
                  onChange={(e) => setNewSecretValue(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!canAccessAdmin || !newSecretValue.trim() || isEncrypting}
                  className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isEncrypting ? 'Encrypting...' : 'Encrypt'}</span>
                </button>
              </div>
            </form>

            {/* List of Stored Encrypted Credentials (Exp 7.2) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Stored Credentials ({secrets.length})</span>
                <span className="font-mono text-[11px] text-pink-300">Format: v1:&#123;nonce&#125;:&#123;ciphertext&#125;</span>
              </div>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {secrets.map((item) => {
                  const isDecrypted = Boolean(decryptedValues[item.id]);
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-200 flex items-center gap-2">
                            <span>{item.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                              {item.provider}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Nonce: {item.nonce} • Updated: {item.updatedAt}
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleDecrypt(item.id, item.ciphertext)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
                        >
                          {isDecrypted ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-cyan-400" />}
                          <span>{isDecrypted ? 'Hide Plaintext' : 'Decrypt'}</span>
                        </button>
                      </div>

                      {/* Display Ciphertext or Decrypted Result */}
                      {isDecrypted ? (
                        <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 font-mono text-xs text-emerald-300 flex items-center justify-between">
                          <span className="break-all">Decrypted: {decryptedValues[item.id]}</span>
                          <span className="text-[10px] font-mono text-emerald-400 uppercase ml-2 shrink-0">
                            ✓ Decrypted via AES-GCM
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400 break-all">
                          <span className="text-pink-400 font-semibold">{item.ciphertext.substring(0, 32)}</span>...
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
