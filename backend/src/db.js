import mysql from 'mysql2/promise';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import config, { validateConfig } from './config.js';

// Load environment variables (will be loaded by index.js, but safe to call again)
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool;

export async function getPool() {
  if (!pool) {
    const missing = validateConfig();
    if (missing.length) {
      console.warn('[db] Missing env keys:', missing.join(', '));
    }

    // On some hosts, env injection can differ by naming. Prefer explicit env vars first,
    // then config.js (which itself supports common aliases).
    const host =
      process.env.DATABASE_HOST ||
      process.env.DB_HOST ||
      config.db.host ||
      '127.0.0.1';
    const port = Number(
      process.env.DATABASE_PORT ||
        process.env.DB_PORT ||
        config.db.port ||
        3306
    );
    const user = process.env.DATABASE_USER || process.env.DB_USER || config.db.user;
    const password = process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || config.db.password;
    const database = process.env.DATABASE_NAME || process.env.DB_NAME || config.db.name;

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4_unicode_ci'
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

export async function initializeSchema() {
  try {
    // In production, schema migrations should be run explicitly (phpMyAdmin/CI), not at runtime.
    // This avoids fragile parsing and MySQL/MariaDB syntax differences causing partial startup.
    if (process.env.DB_AUTO_INIT !== 'true') {
      return;
    }

    const schemaPath = path.resolve(__dirname, '..', 'sql', 'schema.sql');
    const exists = await fs.pathExists(schemaPath);
    if (!exists) {
      console.warn(`[db] schema.sql not found at ${schemaPath}; skipping auto-init`);
      return;
    }

    const sql = await fs.readFile(schemaPath, 'utf8');
    const p = await getPool();

    // NOTE: naive splitting on ';' is still not suitable for stored procedures/triggers.
    // Keep schema.sql simple (DDL only) if you use DB_AUTO_INIT.
    const statements = sql
      .replace(/\r/g, '')
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      await p.query(stmt);
    }
    console.log('[db] schema initialized');
  } catch (err) {
    console.error('[db] schema init error:', err.message);
  }
}

export async function ping() {
  try {
    const rows = await query('SELECT 1 AS ok');
    return rows[0]?.ok === 1;
  } catch (e) {
    return false;
  }
}
