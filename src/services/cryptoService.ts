/**
 * Web Crypto & Security Utilities
 * Directly implementing the cryptographic techniques from Experiment 3 & Experiment 7:
 * - JWT Token generation, signing simulation and decoding (Exp 3.1 & 7.1)
 * - AES-GCM (256-bit key, 12-byte nonce, 128-bit auth tag) formatted as 'v1:<nonce>:<ciphertext>' (Exp 7.2)
 * - SHA-256 one-way hashing for secure refresh token storage (Exp 7.2)
 */

import { JwtTokenPayload, User, UserRole } from '../types';

// Deterministic Master Salt for the Lab Vault AES-256 key
const MASTER_VAULT_KEY_SEED = 'CU_LAB_EXP10_AES_256_KEY_BASE64_94821491';

let cachedCryptoKey: CryptoKey | null = null;

async function getVaultKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;

  const enc = new TextEncoder();
  const rawKeyMaterial = await window.crypto.subtle.digest(
    'SHA-256',
    enc.encode(MASTER_VAULT_KEY_SEED)
  );

  cachedCryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKeyMaterial,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return cachedCryptoKey;
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Exp 7.2 AES-GCM Encryption
 * Output format: "v1:<base64Nonce>:<base64Ciphertext>"
 */
export async function encryptAesGcm(plaintext: string): Promise<{ formatted: string; nonceB64: string; cipherB64: string }> {
  const key = await getVaultKey();
  const enc = new TextEncoder();
  const data = enc.encode(plaintext);

  // 12-byte IV nonce recommended for AES-GCM
  const nonce = window.crypto.getRandomValues(new Uint8Array(12));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128,
    },
    key,
    data
  );

  const nonceB64 = bufferToBase64(nonce);
  const cipherB64 = bufferToBase64(cipherBuffer);
  const formatted = `v1:${nonceB64}:${cipherB64}`;

  return { formatted, nonceB64, cipherB64 };
}

/**
 * Exp 7.2 AES-GCM Decryption
 */
export async function decryptAesGcm(formattedString: string): Promise<string> {
  const parts = formattedString.split(':');
  if (parts.length !== 3 || parts[0] !== 'v1') {
    throw new Error('Unsupported encrypted value format. Must match v1:<nonce>:<ciphertext>');
  }

  const nonce = base64ToBuffer(parts[1]);
  const cipherBytes = base64ToBuffer(parts[2]);

  if (nonce.length !== 12) {
    throw new Error('Invalid AES-GCM nonce length (expected 12 bytes).');
  }

  const key = await getVaultKey();
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce as any,
      tagLength: 128,
    },
    key,
    cipherBytes as any
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

/**
 * Exp 7.2 SHA-256 Hashing for Refresh Token storage
 */
export async function sha256Hash(message: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Exp 3.1 & 7.1 JWT Token Builder
 */
export function createJwtToken(user: User, expiresInMinutes = 15): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const payload: JwtTokenPayload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    iat: now,
    exp: now + expiresInMinutes * 60,
    jti: 'jti_' + Math.random().toString(36).substring(2, 10),
  };

  const b64Header = btoa(JSON.stringify(header));
  const b64Payload = btoa(JSON.stringify(payload));
  // Simulated HMAC-SHA256 signature representation for frontend demo
  const signatureInput = `${b64Header}.${b64Payload}.cu-fullstack2-secret-2026`;
  const signature = btoa(signatureInput).substring(0, 43);

  return `${b64Header}.${b64Payload}.${signature}`;
}

/**
 * Exp 3.1 JWT Token Decoder
 */
export function decodeJwtToken(token: string): {
  header: { alg: string; typ: string } | null;
  payload: JwtTokenPayload | null;
  signature: string;
  isValid: boolean;
  isExpired: boolean;
} {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { header: null, payload: null, signature: '', isValid: false, isExpired: true };
    }

    const header = JSON.parse(atob(parts[0]));
    const payload: JwtTokenPayload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;

    return {
      header,
      payload,
      signature: parts[2],
      isValid: true,
      isExpired,
    };
  } catch {
    return { header: null, payload: null, signature: '', isValid: false, isExpired: true };
  }
}

/**
 * Generate Secure Random Refresh Token (32 bytes url-safe base64)
 */
export function generateRandomRefreshToken(): string {
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  return bufferToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
