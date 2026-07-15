/**
 * db/pool.js — PostgreSQL connection pool
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max:            10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Execute a parameterised query.
 * @param {string} text  SQL with $1, $2 … placeholders
 * @param {Array}  params
 */
export async function query(text, params = []) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - start;
    console.debug(`[DB] ${duration}ms — ${text.slice(0, 80).replace(/\s+/g,' ')}`);
  }
  return result;
}

export default pool;
