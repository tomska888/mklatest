import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

function logError(prefix, err) {
    console.error(prefix, err?.message || err);
}

function requireRoles(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

// POST /api/inquiries - Submit a new inquiry (public)
router.post(
    '/',
    [
        body('name').notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must not exceed 100 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('phone').optional().trim().isLength({ max: 50 }).withMessage('Phone must not exceed 50 characters'),
        body('subject').optional().trim().isLength({ max: 200 }).withMessage('Subject must not exceed 200 characters'),
        body('message').notEmpty().trim().isLength({ min: 1, max: 5000 }).withMessage('Message is required and must not exceed 5000 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, subject, message } = req.body;

        try {
            const result = await query(
                'INSERT INTO customer_inquiries (name, email, phone, subject, message, status) VALUES (?, ?, ?, ?, ?, ?)',
                [name, email, phone || null, subject || null, message, 'pending']
            );

            res.status(201).json({
                ok: true,
                id: result.insertId,
                message: 'Inquiry submitted successfully'
            });
        } catch (err) {
            logError('[inquiries:create]', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// GET /api/inquiries - List all inquiries (admin)
router.get('/', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const { status, limit = 100, offset = 0 } = req.query;
        
        let sql = 'SELECT * FROM customer_inquiries';
        const params = [];

        if (status && ['pending', 'in_progress', 'resolved'].includes(status)) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit, 10), parseInt(offset, 10));

        const rows = await query(sql, params);
        res.json({ items: rows });
    } catch (err) {
        logError('[inquiries:list]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/inquiries/stats - Get inquiry statistics (admin)
router.get('/stats', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const stats = await query(`
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
            FROM customer_inquiries
        `);

        res.json(stats[0] || { total: 0, pending: 0, in_progress: 0, resolved: 0 });
    } catch (err) {
        logError('[inquiries:stats]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/inquiries/:id - Get single inquiry (admin)
router.get('/:id', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inquiry ID' });
        }

        const rows = await query('SELECT * FROM customer_inquiries WHERE id = ? LIMIT 1', [id]);
        if (!rows.length) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        logError('[inquiries:get]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/inquiries/:id/status - Update inquiry status (admin)
router.patch('/:id/status', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inquiry ID' });
        }

        const { status } = req.body;
        if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: pending, in_progress, or resolved' });
        }

        const result = await query('UPDATE customer_inquiries SET status = ? WHERE id = ?', [status, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ ok: true, message: 'Status updated successfully' });
    } catch (err) {
        logError('[inquiries:updateStatus]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/inquiries/:id - Delete inquiry (admin)
router.delete('/:id', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inquiry ID' });
        }

        const result = await query('DELETE FROM customer_inquiries WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        res.json({ ok: true, message: 'Inquiry deleted successfully' });
    } catch (err) {
        logError('[inquiries:delete]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/inquiries/:id/reply - Send email reply to customer (admin)
router.post('/:id/reply', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inquiry ID' });
        }

        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ error: 'Subject and message are required' });
        }

        // Validate length
        if (typeof subject !== 'string' || subject.length > 200) {
            return res.status(400).json({ error: 'Subject must be a string with max 200 characters' });
        }
        if (typeof message !== 'string' || message.length > 10000) {
            return res.status(400).json({ error: 'Message must be a string with max 10,000 characters' });
        }

        // Get inquiry details
        const inquiries = await query('SELECT * FROM customer_inquiries WHERE id = ? LIMIT 1', [id]);
        if (!inquiries.length) {
            return res.status(404).json({ error: 'Inquiry not found' });
        }

        const inquiry = inquiries[0];

        // Send email using nodemailer
        const nodemailer = await import('nodemailer');
        const host = process.env.SMTP_HOST;
        const port = Number(process.env.SMTP_PORT || 465);
        const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
            return res.status(500).json({ error: 'SMTP not configured' });
        }

        const transporter = nodemailer.default.createTransport({
            host,
            port,
            secure,
            auth: { user, pass }
        });

        const from = process.env.SMTP_FROM || user;
        
        await transporter.sendMail({
            from,
            to: inquiry.email,
            subject,
            text: message,
            html: message.replace(/\n/g, '<br>')
        });

        // Save reply to database
        await query(
            'INSERT INTO inquiry_replies (inquiry_id, subject, message, sent_by) VALUES (?, ?, ?, ?)',
            [id, subject, message, req.user.id]
        );

        // Update inquiry status to in_progress if it was pending
        if (inquiry.status === 'pending') {
            await query('UPDATE customer_inquiries SET status = ? WHERE id = ?', ['in_progress', id]);
        }

        res.json({
            ok: true,
            message: 'Reply sent successfully'
        });
    } catch (err) {
        logError('[inquiries:reply]', err);
        res.status(500).json({ error: 'Failed to send reply', details: err.message });
    }
});

// GET /api/inquiries/:id/replies - Get all replies for an inquiry (admin)
router.get('/:id/replies', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid inquiry ID' });
        }

        const replies = await query(
            'SELECT r.*, u.name as sent_by_name FROM inquiry_replies r LEFT JOIN users u ON r.sent_by = u.id WHERE r.inquiry_id = ? ORDER BY r.sent_at DESC',
            [id]
        );

        res.json({ items: replies });
    } catch (err) {
        logError('[inquiries:replies]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
