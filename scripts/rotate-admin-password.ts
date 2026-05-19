/**
 * One-shot admin password rotation.
 *
 * Generates a fresh strong password, hashes it with bcrypt, updates the
 * admin user's password_hash in the SQLite database, and prints the new
 * plaintext password to stdout exactly once.
 *
 * Usage:
 *   tsx scripts/rotate-admin-password.ts            # rotates the default admin (admin@kurikara.local)
 *   tsx scripts/rotate-admin-password.ts foo@bar    # rotates a specific email
 *
 * Notes:
 *   - Respects DATABASE_FILE env var so it works locally and on Fly.io.
 *   - Bcrypt cost 12 matches the existing seed-db.ts standard.
 *   - The plaintext password is printed ONCE — copy it immediately, then
 *     this file's output should not be reused.
 */

import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_FILE ?? 'data/kurikara.db',
);

const targetEmail = process.argv[2] ?? 'admin@kurikaralanka.local';

/**
 * Generate a strong random password.
 *
 * TODO (Dumindu): Implement this. You decide:
 *   - Length: 16 (memorable-ish) vs 24 (recommended) vs 32 (paranoid).
 *   - Alphabet: alphanumeric only ([A-Za-z0-9]) is easier to type on a
 *     phone keyboard; adding symbols (!@#$%^&*) is stronger but annoying.
 *   - Source of randomness: MUST be crypto.randomBytes(), NEVER Math.random()
 *     (Math.random is predictable and not safe for secrets).
 *
 * Recommended starting point: 24 chars, alphanumeric + a small symbol set.
 *
 * Example skeleton:
 *
 *   const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ' +    // no I, O — visually ambiguous
 *                    'abcdefghijkmnpqrstuvwxyz' +    // no l, o
 *                    '23456789' +                    // no 0, 1
 *                    '!@#$%^&*';
 *   const LENGTH = 24;
 *   const bytes = crypto.randomBytes(LENGTH);
 *   let out = '';
 *   for (let i = 0; i < LENGTH; i++) {
 *     out += ALPHABET[bytes[i] % ALPHABET.length];
 *   }
 *   return out;
 *
 * Why `% ALPHABET.length` is subtly biased and how to fix it: see
 * https://en.wikipedia.org/wiki/Random_number_generation#Bias
 * For password generation at this length the bias is negligible.
 */
function generatePassword(): string {
  // 24-char alphanumeric, no visually ambiguous chars (I, l, O, 0, 1).
  // ~143 bits of entropy — astronomical brute-force margin.
  const ALPHABET =
    'ABCDEFGHJKLMNPQRSTUVWXYZ' + // no I, O
    'abcdefghijkmnopqrstuvwxyz' + // no l
    '23456789'; // no 0, 1
  const LENGTH = 24;
  const bytes = crypto.randomBytes(LENGTH);
  let out = '';
  for (let i = 0; i < LENGTH; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  const user = db
    .prepare('SELECT id, email, role FROM users WHERE email = ?')
    .get(targetEmail) as { id: string; email: string; role: string } | undefined;

  if (!user) {
    console.error(`✗ No user found with email "${targetEmail}".`);
    console.error('  Available admins:');
    const admins = db
      .prepare("SELECT email FROM users WHERE role = 'admin'")
      .all() as { email: string }[];
    for (const a of admins) console.error(`    - ${a.email}`);
    process.exit(1);
  }

  const newPassword = generatePassword();
  const hash = await bcrypt.hash(newPassword, 12);

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✓ Admin password rotated');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Email:    ${user.email}`);
  console.log(`  Role:     ${user.role}`);
  console.log(`  Password: ${newPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Copy this NOW. It will not be shown again.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  db.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
