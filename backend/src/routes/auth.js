import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { query } from '../db.js';
import { logError } from '../logger.js';

const router = express.Router();

// Basic brute-force protection for auth endpoints.
// Uses in-memory store by default (fine for single-node shared hosting).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false
});

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) return secret;

  // In production, never allow a weak/missing secret.
  if ((process.env.NODE_ENV || 'production') === 'production') {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars)');
  }

  // In dev, allow a fallback so the app can boot, but make it noisy.
  console.warn('[auth] Using insecure JWT secret fallback; set JWT_SECRET for real deployments');
  return 'dev-insecure-jwt-secret-change-me';
}

function signToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email, name: user.name, phone: user.phone ?? null };
  const secret = getJwtSecret();
  const expiresIn = process.env.TOKEN_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
}

function authMiddleware(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Optional auth middleware - sets req.user if token is valid, but doesn't fail if missing
function optionalAuthMiddleware(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    next();
  } catch (e) {
    // Invalid token - treat as unauthenticated
    req.user = null;
    next();
  }
}

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').isLength({ min: 2, max: 191 }),
    body('phone').optional().isLength({ min: 6, max: 32 }).trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name, phone } = req.body;
    try {
      const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length) return res.status(409).json({ error: 'Email already registered' });

      const hash = await bcrypt.hash(password, 10);
      const result = await query(
        'INSERT INTO users (email, password_hash, name, phone, role) VALUES (?, ?, ?, ?, ?)',
        [email, hash, name, phone || null, 'user']
      );
      const user = { id: result.insertId, email, name, phone: phone || null, role: 'user' };
      const token = signToken(user);
      res.status(201).json({ user, token });
    } catch (err) {
      logError('[auth/register]', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const users = await query('SELECT id, email, password_hash, name, phone, role FROM users WHERE email = ?', [email]);
      if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });
      const u = users[0];
      const ok = await bcrypt.compare(password, u.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const user = { id: u.id, email: u.email, name: u.name, phone: u.phone, role: u.role };
      const token = signToken(user);
      res.json({ user, token });
    } catch (err) {
      console.error('LOGIN ERROR:', err);
      return res.status(500).json({ message: 'Internal error' });
    }
  }
);

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const users = await query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!users.length) return res.status(404).json({ error: 'Not found' });
    res.json({ user: users[0] });
  } catch (err) {
    logError('[auth/me]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/me -> update profile (name)
router.put(
  '/me',
  authMiddleware,
  [body('name').trim().isLength({ min: 2, max: 191 }), body('phone').optional().isLength({ min: 6, max: 32 }).trim()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, phone } = req.body;
    try {
      await query('UPDATE users SET name = ?, phone = COALESCE(?, phone) WHERE id = ?', [name, phone ?? null, req.user.id]);
      const rows = await query('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
      const user = rows[0];
      const token = signToken(user);
      res.json({ user, token });
    } catch (err) {
      logError('[auth:update-me]', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/auth/change-password
router.post(
  '/change-password',
  authMiddleware,
  [
    body('current_password').isLength({ min: 6 }),
    body('new_password').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { current_password, new_password } = req.body;
    try {
      const users = await query('SELECT id, password_hash FROM users WHERE id = ?', [req.user.id]);
      if (!users.length) return res.status(404).json({ error: 'Not found' });
      const u = users[0];
      const ok = await bcrypt.compare(current_password, u.password_hash);
      if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });

      const hash = await bcrypt.hash(new_password, 10);
      await query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
      res.json({ ok: true });
    } catch (err) {
      logError('[auth:change-password]', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// DELETE /api/auth/me -> delete current user account
router.delete('/me', authMiddleware, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = ?', [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    logError('[auth:delete-me]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
export { authMiddleware, optionalAuthMiddleware };
