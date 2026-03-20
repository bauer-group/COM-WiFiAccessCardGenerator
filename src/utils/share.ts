import type { WifiNetwork, SharePayload } from '@/types';
import { encrypt, decrypt, encodePayload, decodePayload } from './crypto';

/** Safe URL length limit — conservative to work across all browsers/platforms */
export const MAX_URL_LENGTH = 8_000;

/**
 * Strip fields not needed for sharing to minimize payload size.
 */
function stripMetadata(networks: WifiNetwork[]): WifiNetwork[] {
  return networks.map(({ id, createdAt, updatedAt, ...rest }) => ({
    ...rest,
    createdAt: '',
    updatedAt: '',
  }));
}

/**
 * Create a shareable URL fragment containing network data.
 * Format: #d=<base64url> (unencrypted) or #e=<base64url> (encrypted)
 * The encrypted payload is the raw salt.iv.ciphertext string from crypto.ts.
 */
export async function createShareLink(
  networks: WifiNetwork[],
  password?: string,
): Promise<string> {
  const payload: SharePayload = {
    version: 1,
    networks: stripMetadata(networks),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(payload);
  let fragment: string;

  if (password) {
    // encrypt() returns "salt.iv.ciphertext" in base64url — already URL-safe
    const encrypted = await encrypt(json, password);
    fragment = 'e=' + encrypted;
  } else {
    fragment = 'd=' + encodePayload(json);
  }

  const base = window.location.href.split('#')[0];
  return `${base}#${fragment}`;
}

/**
 * Parse import data from URL fragment.
 * Returns null if no import data is present.
 */
export function parseShareFragment(hash: string): {
  encrypted: boolean;
  data: string;
} | null {
  if (!hash || hash.length < 3) return null;

  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;

  if (fragment.startsWith('d=')) {
    const encoded = fragment.slice(2);
    const json = decodePayload(encoded);
    return { encrypted: false, data: json };
  }

  if (fragment.startsWith('e=')) {
    const raw = fragment.slice(2);
    return { encrypted: true, data: raw };
  }

  return null;
}

/**
 * Decrypt and parse an encrypted share payload.
 * Accepts the raw "salt.iv.ciphertext" string directly.
 */
export async function decryptSharePayload(
  encryptedData: string,
  password: string,
): Promise<SharePayload> {
  const json = await decrypt(encryptedData, password);
  return JSON.parse(json) as SharePayload;
}

/**
 * Parse an unencrypted share payload.
 */
export function parseSharePayload(data: string): SharePayload {
  return JSON.parse(data) as SharePayload;
}
