/**
 * Encrypt/decrypt share payloads using Web Crypto API (PBKDF2 + AES-GCM).
 * All operations are client-side only — no secrets leave the browser.
 */

const PBKDF2_ITERATIONS = 310_000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encrypt(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  const saltB64 = toBase64Url(salt.buffer as ArrayBuffer);
  const ivB64 = toBase64Url(iv.buffer as ArrayBuffer);
  const dataB64 = toBase64Url(ciphertext);

  return `${saltB64}.${ivB64}.${dataB64}`;
}

export async function decrypt(encrypted: string, password: string): Promise<string> {
  const [saltB64, ivB64, dataB64] = encrypted.split('.');
  if (!saltB64 || !ivB64 || !dataB64) {
    throw new Error('Invalid encrypted payload format');
  }

  const salt = fromBase64Url(saltB64);
  const iv = fromBase64Url(ivB64);
  const data = fromBase64Url(dataB64);
  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

export function encodePayload(json: string): string {
  const encoded = new TextEncoder().encode(json);
  return toBase64Url(encoded.buffer as ArrayBuffer);
}

export function decodePayload(encoded: string): string {
  const bytes = fromBase64Url(encoded);
  return new TextDecoder().decode(bytes);
}
