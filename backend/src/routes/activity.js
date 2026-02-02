import { Router } from 'express';
import { getPool } from '../db.js';

const router = Router();

/**
 * GET /api/activity
 * List activity logs with pagination
 * Query params: page (default 1), pageSize (default 10)
 */
router.get('/', async (req, res) => {
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
 * Create a new activity log entry
 * Body: { action: string, details?: string, userId?: number }
 */
router.post('/', async (req, res) => {
  try {
    const { action, details, userId } = req.body;

    if (!action || typeof action !== 'string') {
      return res.status(400).json({ error: 'action is required and must be a string' });
    }

    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO activity_logs (action, details, user_id) VALUES (?, ?, ?)',
      [action.trim(), details || null, userId || null]
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
 * Delete an activity log entry (optional - for cleanup)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Invalid activity log ID' });
    }

    const pool = await getPool();
    await pool.query('DELETE FROM activity_logs WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('[activity] delete error:', error);
    res.status(500).json({ error: 'Failed to delete activity log' });
  }
});

export default router;
