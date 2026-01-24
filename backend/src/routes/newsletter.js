import express from 'express';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';
import { query } from '../db.js';
import { authMiddleware } from './auth.js';

const router = express.Router();

function requireRoles(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

function createTransport() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = String(process.env.SMTP_SECURE || 'true') === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP not configured');
    }

    return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

// POST /api/newsletter/subscribe
router.post(
    '/subscribe',
    [body('email').isEmail().normalizeEmail()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email } = req.body;
        try {
            await query('INSERT INTO newsletter_subscribers (email) VALUES (?) ON DUPLICATE KEY UPDATE email = email', [email]);
            res.status(201).json({ ok: true });
        } catch (err) {
            logError('[newsletter:subscribe]', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

// GET /api/newsletter/subscribers (admin)
router.get('/subscribers', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const rows = await query('SELECT id, email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC');
        res.json({ items: rows });
    } catch (err) {
        logError('[newsletter:list]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/newsletter/send (admin) {subject, html?, text?}
router.post('/send', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const { subject, html, text } = req.body || {};
        if (!subject || (!html && !text)) return res.status(400).json({ error: 'Missing subject or content' });

        const subs = await query('SELECT email FROM newsletter_subscribers');
        const emails = subs.map(s => s.email);
        if (!emails.length) return res.json({ sent: 0 });

        const transporter = createTransport();
        const from = process.env.SMTP_FROM || 'no-reply@example.com';

        const chunkSize = 50; // basic batching
        let sent = 0;
        for (let i = 0; i < emails.length; i += chunkSize) {
            const batch = emails.slice(i, i + chunkSize);
            const info = await transporter.sendMail({
                from,
                bcc: batch,
                subject,
                text: text || undefined,
                html: html || undefined
            });
            if (info.accepted) sent += info.accepted.length;
        }

        res.json({ sent });
    } catch (err) {
        logError('[newsletter:send]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/newsletter/me -> current user's subscription status + preferences
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const rows = await query('SELECT email_notifications, new_listings FROM newsletter_subscribers WHERE email = ? LIMIT 1', [email]);
        if (!rows.length) return res.json({ subscribed: false, email, email_notifications: false, new_listings: false });
        const pref = rows[0];
        res.json({ subscribed: true, email, email_notifications: !!pref.email_notifications, new_listings: !!pref.new_listings });
    } catch (err) {
        logError('[newsletter:me]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/newsletter/preferences -> update current user's preferences
router.put('/preferences', authMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        const email_notifications = req.body?.email_notifications ? 1 : 0;
        const new_listings = req.body?.new_listings ? 1 : 0;
        await query(
            'INSERT INTO newsletter_subscribers (email, email_notifications, new_listings) VALUES (?, ?, ?)\n            ON DUPLICATE KEY UPDATE email_notifications = VALUES(email_notifications), new_listings = VALUES(new_listings)'
            , [email, email_notifications, new_listings]
        );
        res.json({ ok: true });
    } catch (err) {
        logError('[newsletter:prefs]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/newsletter/subscribe -> unsubscribe current user
router.delete('/subscribe', authMiddleware, async (req, res) => {
    try {
        const email = req.user.email;
        await query('DELETE FROM newsletter_subscribers WHERE email = ?', [email]);
        res.json({ ok: true });
    } catch (err) {
        logError('[newsletter:unsubscribe]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
