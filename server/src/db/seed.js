/**
 * db/seed.js — Bootstrap first admin account
 * Run: node src/db/seed.js
 */
import argon2 from 'argon2';
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  const email    = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('[seed] ❌  Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const hash = await argon2.hash(password, {
    type:       argon2.argon2id,
    memoryCost: 65536,
    timeCost:   3,
    parallelism: 1,
  });

  const client = await pool.connect();
  try {
    const existing = await client.query(
      'SELECT id FROM admins WHERE email = $1', [email]
    );
    if (existing.rows.length > 0) {
      console.log('[seed] Admin already exists — skipping.');
    } else {
      await client.query(
        'INSERT INTO admins (email, password_hash) VALUES ($1, $2)',
        [email, hash]
      );
      console.log(`[seed] ✅  Admin created: ${email}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
