import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { authMiddleware } from './auth.js';
import { logError } from '../logger.js';

import config from '../config.js';

const router = express.Router();

function requireRoles(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

// Ensure there is a row with id=1
async function ensureRow() {
    await query(
        `INSERT INTO company_info (id, name, address, phone, email, lat, lng, about)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id=id`,
        [
            process.env.COMPANY_NAME || 'AM Automobile',
            process.env.COMPANY_ADDRESS || null,
            process.env.COMPANY_PHONE || null,
            process.env.COMPANY_EMAIL || null,
            process.env.COMPANY_LAT || null,
            process.env.COMPANY_LNG || null,
            'About AM Automobile'
        ]
    );
}

// GET /api/company
router.get('/', async (req, res) => {
    try {
        await ensureRow();
        const rows = await query('SELECT id, name, address, phone, email, lat, lng, about FROM company_info WHERE id = 1');
        const row = rows[0] || {};
        // Serve company info primarily from DB so admin edits persist.
        // Fall back to env/config values if DB fields are empty.
        res.json({
            id: 1,
            name: row.name || config.company.name,
            address: row.address || config.company.address,
            phone: row.phone || config.company.phone,
            email: row.email || config.company.email,
            lat: row.lat ?? config.company.lat,
            lng: row.lng ?? config.company.lng,
            about: row.about
        });
    } catch (err) {
        logError('[company:get]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/company (admin)
router.put(
    '/',
    authMiddleware,
    requireRoles(['owner', 'admin', 'employee']),
    [
        body('name').optional().isLength({ min: 2, max: 191 }),
        body('address').optional().isLength({ min: 2, max: 255 }),
        body('phone').optional().isLength({ min: 3, max: 64 }),
        body('email').optional().isEmail().normalizeEmail(),
        body('lat').optional().isFloat({ min: -90, max: 90 }),
        body('lng').optional().isFloat({ min: -180, max: 180 }),
        body('about').optional().isLength({ min: 0, max: 5000 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        try {
            await ensureRow();
            const fields = ['name', 'address', 'phone', 'email', 'lat', 'lng', 'about'];
            const sets = [];
            const params = [];
            for (const f of fields) {
                if (Object.prototype.hasOwnProperty.call(req.body, f)) {
                    sets.push(`${f} = ?`);
                    params.push(req.body[f]);
                }
            }
            if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
            params.push(1);
            await query(`UPDATE company_info SET ${sets.join(', ')} WHERE id = ?`, params);
            const rows = await query('SELECT id, name, address, phone, email, lat, lng, about FROM company_info WHERE id = 1');
            res.json(rows[0] || {});
        } catch (err) {
            logError('[company:update]', err);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

export default router;
