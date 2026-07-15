/**
 * db/migrate.js — Apply schema.sql to the database
 * Run: node src/db/migrate.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pool from './pool.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('[migrate] Running schema…');
    await client.query(sql);
    console.log('[migrate] ✅ Schema applied successfully.');
  } catch (err) {
    console.error('[migrate] ❌ Error:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
