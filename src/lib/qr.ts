/**
 * Short 8-char base32 codes for QR labels (no padding, uppercase).
 * 32^8 = ~1 trillion combinations; collisions effectively impossible.
 *
 * Prefixes:
 *   'KH' → Item code  (links to /items/<id>)
 *   'KR' → Room/location code  (links to /r/<slug>)
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

export type QrPrefix = 'KH' | 'KR';

export function generateQrCode(prefix: QrPrefix = 'KH'): string {
  const len = 6;
  let out = prefix;
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const arr = new Uint8Array(len);
    globalThis.crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) {
      out += ALPHABET[arr[i] % ALPHABET.length];
    }
  } else {
    for (let i = 0; i < len; i++) {
      out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
  return out;
}

export function classifyQrCode(code: string): 'item' | 'room' | 'unknown' {
  const c = code.toUpperCase();
  if (c.startsWith('KH')) return 'item';
  if (c.startsWith('KR')) return 'room';
  return 'unknown';
}
