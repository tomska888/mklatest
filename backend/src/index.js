import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import authRouter from './routes/auth.js';
import carsRouter from './routes/cars.js';
import newsletterRouter from './routes/newsletter.js';
import companyRouter from './routes/company.js';
import favoritesRouter from './routes/favorites.js';
import { initializeSchema, ping, getPool } from './db.js';

// Load environment variables
// In production on managed hosts (e.g., Hostinger hPanel), environment variables are injected
// by the platform. Only load .env in development to avoid overriding platform-injected vars.
// Note: If Hostinger doesn't inject vars, you must manually upload a .env file or use config.local.json
if ((process.env.NODE_ENV || 'production') !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);

// Basic security and performance middleware
app.use(helmet());

// Suppress Permissions-Policy warnings for experimental features
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy',
    'compute-pressure=(), attribution-reporting=(), private-aggregation=(), ' +
    'join-ad-interest-group=(), run-ad-auction=(), browsing-topics=()'
  );
  next();
});

// CORS: prefer explicit origins. If CORS_ORIGINS is not set, default to reflecting origin
// WITHOUT credentials (safer default). Set CORS_ORIGINS="https://example.com,https://www.example.com"
// to enable credentialed cross-site requests.
const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors(
    corsOrigins.length
      ? {
        origin(origin, cb) {
          // allow non-browser / same-origin (no Origin header)
          if (!origin) return cb(null, true);
          return cb(null, corsOrigins.includes(origin));
        },
        credentials: true
      }
      : {
        origin: true,
        credentials: false
      }
  )
);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// Ensure public and uploads directories exist
const publicDir = path.join(__dirname, '..', 'public');
const uploadsDir = path.join(publicDir, 'uploads');
fs.ensureDirSync(publicDir);
fs.ensureDirSync(uploadsDir);

// Debug endpoints to verify uploads directory and files in production.
// Gate them behind NODE_ENV !== 'production' to avoid exposing filesystem metadata.
if ((process.env.NODE_ENV || 'production') !== 'production') {
  app.get('/api/__debug__/uploads', async (req, res) => {
    try {
      const entries = await fs.readdir(uploadsDir);
      res.json({ uploadsDir, count: entries.length, entries });
    } catch (e) {
      res.status(500).json({ error: e?.message || String(e), uploadsDir });
    }
  });
  app.get('/api/__debug__/uploads/:name', async (req, res) => {
    try {
      const name = path.basename(req.params.name || '');
      const fp = path.join(uploadsDir, name);
      const exists = await fs.pathExists(fp);
      if (!exists) return res.status(404).json({ exists: false, path: fp });
      return res.sendFile(fp);
    } catch (e) {
      res.status(500).json({ error: e?.message || String(e) });
    }
  });
}

// Serve uploads explicitly before general static to avoid SPA fallback capturing it
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: false }));
// Also expose uploads under /api/uploads for hosts that only proxy /api to Node
app.use('/api/uploads', express.static(uploadsDir, { maxAge: '7d', fallthrough: false }));

// If your hosting setup only forwards /api/* to Node, browsers won't be able to reach /uploads/*.
// Default stored URLs to /api/uploads, while still serving /uploads when it's available.
process.env.UPLOADS_BASE_PATH = process.env.UPLOADS_BASE_PATH || '/api/uploads';

// Serve static frontend (will be synced/built into backend/public)
app.use(express.static(publicDir, { maxAge: '1d', extensions: ['html'] }));

// Health check with DB diagnostics
app.get('/api/health', async (req, res) => {
  let db = false;
  let db_error = null;
  try {
    // Try simple ping first
    db = await ping();
    if (!db) {
      // Fallback: explicit pool query to capture error details
      const pool = await getPool();
      const [rows] = await pool.query('SELECT 1 AS ok');
      db = Array.isArray(rows) ? rows[0]?.ok === 1 : rows?.ok === 1;
    }
  } catch (e) {
    db_error = e?.message || String(e);
  }
  res.json({
    ok: true,
    db,
    db_error,
    // Avoid leaking infra metadata publicly; keep these only outside production.
    ...(process.env.NODE_ENV !== 'production'
      ? {
          db_host: process.env.DATABASE_HOST,
          db_name: process.env.DATABASE_NAME
        }
      : {}),
    // In production, include minimal env diagnostics when DB is down.
    // This helps debug hosting env injection issues without exposing passwords.
    ...(process.env.NODE_ENV === 'production' && !db
      ? {
          env_diag: {
            DATABASE_HOST_set: !!process.env.DATABASE_HOST,
            DATABASE_PORT_set: !!process.env.DATABASE_PORT,
            DATABASE_USER_set: !!process.env.DATABASE_USER,
            DATABASE_PASSWORD_set: !!process.env.DATABASE_PASSWORD,
            DATABASE_NAME_set: !!process.env.DATABASE_NAME,
            DATABASE_HOST: process.env.DATABASE_HOST || null,
            DATABASE_PORT: process.env.DATABASE_PORT || null,
            DATABASE_USER_len: (process.env.DATABASE_USER || '').length,
            DATABASE_NAME_len: (process.env.DATABASE_NAME || '').length
          }
        }
      : {}),
    service: 'AM Automobile API',
    env: process.env.NODE_ENV || 'production',
    time: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/cars', carsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/company', companyRouter);
app.use('/api/favorites', favoritesRouter);

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  // do not handle API or uploads here
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
  return res.status(200).send('Frontend not built yet.');
});

// Initialize DB schema in background (safe to run repeatedly)
initializeSchema().catch(err => console.error('[db] init failed:', err));

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`AM Automobile API listening on http://${HOST}:${PORT}`);
});
