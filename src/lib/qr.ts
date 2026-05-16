/**
 * Short 8-char base32 codes for QR labels (no padding, uppercase).
 * 32^8 = ~1 trillion combinations; collisions effectively impossible.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

export function generateQrCode(prefix = 'KH'): string {
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
