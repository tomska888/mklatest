import { Router } from 'express';
import { getPool } from '../db.js';
import { authMiddleware } from './auth.js';

const router = Router();

/**
 * Role-based access control middleware
 */
function requireRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/**
 * GET /api/activity
 * List activity logs with pagination (Admin only)
 * Query params: page (default 1), pageSize (default 10)
 */
router.get('/', authMiddleware, requireRoles(['owner', 'admin']), async (req, res) => {
  try {
    const pool = await getPool();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize) || 10));
    const offset = (page - 1) * pageSize;

    // Get total count
    const [countRows] = await pool.query('SELECT COUNT(*) as total FROM activity_logs');
    const total = countRows[0]?.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated results
    const [rows] = await pool.query(
      `SELECT id, action, details, user_id, created_at 
       FROM activity_logs 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    res.json({
      items: rows.map(row => ({
        id: row.id,
        action: row.action,
        details: row.details,
        userId: row.user_id,
        createdAt: row.created_at
      })),
      page,
      pageSize,
      total,
      totalPages
    });
  } catch (error) {
    console.error('[activity] list error:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

/**
 * POST /api/activity
 * Create a new activity log entry (Authenticated users)
 * Body: { action: string, details?: string }
 * Note: userId is automatically set from authenticated user, not from request body
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { action, details } = req.body;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'action is required and must be a string' });
    }

    // Validate action length
    if (action.length > 255) {
      return res.status(400).json({ error: 'action must not exceed 255 characters' });
    }

    // Validate details length if provided
    if (details && typeof details === 'string' && details.length > 5000) {
      return res.status(400).json({ error: 'details must not exceed 5000 characters' });
    }

    // Use authenticated user's ID instead of trusting client input
    const userId = req.user.id;

    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)',
      [action.trim(), details || null, userId]
    );

    // Fetch the newly created log entry
    const [rows] = await pool.query(
      'SELECT id, action, details, user_id, created_at FROM activity_logs WHERE id = ?',
      [result.insertId]
    );

    const log = rows[0];
    res.status(201).json({
      id: log.id,
      action: log.action,
      details: log.details,
      userId: log.user_id,
      createdAt: log.created_at
    });
  } catch (error) {
    console.error('[activity] create error:', error);
    res.status(500).json({ error: 'Failed to create activity log' });
  }
});

/**
 * DELETE /api/activity/:id
 * Delete an activity log entry (Admin only)
 */
router.delete('/:id', authMiddleware, requireRoles(['owner', 'admin']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    
    // Improved validation: check for NaN and negative numbers
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid activity log ID' });
    }

    const pool = await getPool();
    const [result] = await pool.query('DELETE FROM activity_logs WHERE id = ?', [id]);
    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Activity log not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('[activity] delete error:', error);
    res.status(500).json({ error: 'Failed to delete activity log' });
  }
});

export default router;
