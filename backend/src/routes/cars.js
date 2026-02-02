import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { authMiddleware } from './auth.js';
import { logError } from '../logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

function requireRoles(roles = []) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    };
}

const uploadsDir = path.resolve(__dirname, '..', '..', 'public', 'uploads');
fs.ensureDirSync(uploadsDir);
// Base URL path used when saving file URLs to DB (allows hosts that only proxy /api)
const uploadsBasePath = process.env.UPLOADS_BASE_PATH || '/uploads';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase();
        const name = uuidv4().replace(/-/g, '');
        cb(null, `${name}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/ogg'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

// Separate filter for documents (PDF/Office/images)
const docFileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg', 'image/png', 'image/webp'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported document type'));
};
const uploadDocs = multer({ storage, fileFilter: docFileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

function toSqlFilters(qs, requirePublished = false) {
    const cond = [];
    const params = [];

    // Only show published cars for public-facing requests
    if (requirePublished) {
        cond.push('published = 1');
    }

    if (qs.make) { cond.push('make = ?'); params.push(qs.make); }
    if (qs.model) { cond.push('model = ?'); params.push(qs.model); }
    if (qs.yearMin) { cond.push('year >= ?'); params.push(Number(qs.yearMin)); }
    if (qs.yearMax) { cond.push('year <= ?'); params.push(Number(qs.yearMax)); }
    if (qs.priceMin) { cond.push('price >= ?'); params.push(Number(qs.priceMin)); }
    if (qs.priceMax) { cond.push('price <= ?'); params.push(Number(qs.priceMax)); }
    if (qs.mileageMax) { cond.push('mileage <= ?'); params.push(Number(qs.mileageMax)); }
    if (qs.fuel_type) { cond.push('fuel_type = ?'); params.push(qs.fuel_type); }
    if (qs.transmission) { cond.push('transmission = ?'); params.push(qs.transmission); }
    if (qs.body_type) { cond.push('body_type = ?'); params.push(qs.body_type); }
    if (qs.color) { cond.push('color = ?'); params.push(qs.color); }
    if (qs.featured === '1' || qs.featured === 'true') { cond.push('featured = 1'); }
    if (qs.q) {
        const like = `%${qs.q}%`;
        cond.push('(title LIKE ? OR description LIKE ? OR make LIKE ? OR model LIKE ?)');
        params.push(like, like, like, like);
    }

    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    return { where, params };
}

function toOrderBy(sort) {
    switch (sort) {
        case 'price_asc': return 'ORDER BY price ASC';
        case 'price_desc': return 'ORDER BY price DESC';
        case 'year_asc': return 'ORDER BY year ASC';
        case 'year_desc': return 'ORDER BY year DESC';
        case 'mileage_asc': return 'ORDER BY mileage ASC';
        case 'created_at_asc': return 'ORDER BY created_at ASC';
        case 'created_at_desc':
        default: return 'ORDER BY created_at DESC';
    }
}

// GET /api/cars
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.max(1, Math.min(50, parseInt(req.query.pageSize) || 12));
        const offset = (page - 1) * pageSize;
        const sort = toOrderBy(req.query.sort);

        // Only show published cars to non-admin users
        // Admin users (authenticated with proper roles) can see all cars
        const isAdmin = req.user && ['owner', 'admin', 'employee'].includes(req.user.role);
        const requirePublished = !isAdmin;

        const { where, params } = toSqlFilters(req.query, requirePublished);

        const totalRows = await query(`SELECT COUNT(*) as cnt FROM cars ${where}`, params);
        const total = totalRows[0]?.cnt || 0;

        const rows = await query(
            `SELECT c.id, c.title, c.make, c.model, c.year, c.price, c.mileage, c.fuel_type, c.transmission, c.body_type, c.color, c.featured, c.published, c.created_at,
                    (SELECT url FROM car_media m WHERE m.car_id = c.id AND m.type = 'image' ORDER BY m.id ASC LIMIT 1) AS thumb_url
               FROM cars c ${where} ${sort} LIMIT ? OFFSET ?`,
            [...params, pageSize, offset]
        );

        res.json({ items: rows, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
    } catch (err) {
        logError('[cars:list]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cars/:id
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        // Only show published cars to non-admin users
        const isAdmin = req.user && ['owner', 'admin', 'employee'].includes(req.user.role);
        const publishedCondition = isAdmin ? '' : ' AND published = 1';
        
        const cars = await query(`SELECT * FROM cars WHERE id = ?${publishedCondition}`, [id]);
        if (!cars.length) return res.status(404).json({ error: 'Not found' });
        const car = cars[0];
        const media = await query('SELECT id, type, url, filename, display_order FROM car_media WHERE car_id = ? ORDER BY display_order ASC, id ASC', [id]);
        const featuresRows = await query('SELECT name FROM car_features WHERE car_id = ? ORDER BY name ASC', [id]);
        const specsRows = await query('SELECT `key`, `value` FROM car_specs WHERE car_id = ? ORDER BY id ASC', [id]);
        const docsRows = await query('SELECT id, url, filename, doc_type FROM car_documents WHERE car_id = ? ORDER BY id ASC', [id]);
        const specs = {};
        for (const r of specsRows) specs[r.key] = r.value;
        res.json({ ...car, media, features: featuresRows.map(r => r.name), specs, documents: docsRows });
    } catch (err) {
        logError('[cars:get]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cars
router.post('/', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const { title, make, model, year, price, mileage, fuel_type, transmission, body_type, color, vin, description, featured } = req.body;

        const result = await query(
            `INSERT INTO cars (title, make, model, year, price, mileage, fuel_type, transmission, body_type, color, vin, description, featured, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, make, model, Number(year), Number(price), mileage || 0, fuel_type || null, transmission || null, body_type || null, color || null, vin || null, description || null, featured ? 1 : 0, req.user.id]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        logError('[cars:create]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cars/:id
router.put('/:id', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const fields = ['title', 'make', 'model', 'year', 'price', 'mileage', 'fuel_type', 'transmission', 'body_type', 'color', 'vin', 'description', 'featured'];
        const sets = [];
        const params = [];
        for (const f of fields) {
            if (req.body.hasOwnProperty(f)) {
                sets.push(`${f} = ?`);
                if (f === 'year' || f === 'price') params.push(Number(req.body[f]));
                else if (f === 'featured') params.push(req.body[f] ? 1 : 0);
                else params.push(req.body[f]);
            }
        }
        if (!sets.length) return res.status(400).json({ error: 'No fields to update' });
        params.push(id);

        await query(`UPDATE cars SET ${sets.join(', ')} WHERE id = ?`, params);
        res.json({ ok: true });
    } catch (err) {
        logError('[cars:update]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cars/:id
router.delete('/:id', authMiddleware, requireRoles(['owner', 'admin']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await query('DELETE FROM cars WHERE id = ?', [id]);
        res.json({ ok: true });
    } catch (err) {
        logError('[cars:delete]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/cars/:id/feature
router.patch('/:id/feature', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const featured = req.body?.featured ? 1 : 0;
        
        // Check if car is published before allowing it to be featured
        if (featured) {
            const cars = await query('SELECT published FROM cars WHERE id = ?', [id]);
            if (cars.length && !cars[0].published) {
                return res.status(400).json({ error: 'Cannot feature an unpublished vehicle' });
            }
        }
        
        await query('UPDATE cars SET featured = ? WHERE id = ?', [featured, id]);
        res.json({ ok: true, featured });
    } catch (err) {
        logError('[cars:feature]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PATCH /api/cars/:id/publish
router.patch('/:id/publish', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const published = req.body?.published ? 1 : 0;
        
        // If unpublishing, also remove featured status
        if (!published) {
            await query('UPDATE cars SET published = ?, featured = 0 WHERE id = ?', [published, id]);
        } else {
            await query('UPDATE cars SET published = ? WHERE id = ?', [published, id]);
        }
        
        res.json({ ok: true, published });
    } catch (err) {
        logError('[cars:publish]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cars/:id/media (upload multiple)
router.post('/:id/media', authMiddleware, requireRoles(['owner', 'admin', 'employee']), upload.array('files', 10), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const files = req.files || [];
        
        // Get the current max display_order for this car
        const maxOrderResult = await query('SELECT MAX(display_order) as max_order FROM car_media WHERE car_id = ?', [id]);
        let nextOrder = (maxOrderResult[0]?.max_order || 0) + 1;
        
        const values = [];
        for (const f of files) {
            const isVideo = (f.mimetype || '').startsWith('video/');
            const type = isVideo ? 'video' : 'image';
            const url = `${uploadsBasePath}/${f.filename}`;
            values.push([id, type, url, f.originalname || null, nextOrder++]);
        }

        for (const v of values) {
            await query('INSERT INTO car_media (car_id, type, url, filename, display_order) VALUES (?, ?, ?, ?, ?)', v);
        }

        res.status(201).json({ uploaded: values.length });
    } catch (err) {
        logError('[cars:upload]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cars/:id/media/reorder - Update display order of media
router.put('/:id/media/reorder', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { order } = req.body; // Array of media IDs in desired order
        
        if (!Array.isArray(order)) {
            return res.status(400).json({ error: 'Invalid order array' });
        }

        // Update display_order for each media item
        for (let i = 0; i < order.length; i++) {
            await query('UPDATE car_media SET display_order = ? WHERE id = ? AND car_id = ?', [i, order[i], id]);
        }

        res.json({ ok: true });
    } catch (err) {
        logError('[cars:media:reorder]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cars/:id/media/:mediaId
router.delete('/:id/media/:mediaId', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const mediaId = parseInt(req.params.mediaId);

        const rows = await query('SELECT url FROM car_media WHERE id = ? AND car_id = ?', [mediaId, id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });

        const url = rows[0].url || '';
        await query('DELETE FROM car_media WHERE id = ?', [mediaId]);

        // Best-effort file unlink only for local uploads path
        if (typeof uploadsBasePath === 'string' && url.startsWith(`${uploadsBasePath}/`)) {
            const fp = path.join(uploadsDir, path.basename(url));
            fs.remove(fp).catch(() => { });
        }

        res.json({ ok: true });
    } catch (err) {
        logError('[cars:media:delete]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cars/:id/features (replace all features)
router.put('/:id/features', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const features = Array.isArray(req.body.features) ? req.body.features : [];
        await query('DELETE FROM car_features WHERE car_id = ?', [id]);
        for (const name of features.map(f => String(f).trim()).filter(Boolean)) {
            await query('INSERT INTO car_features (car_id, name) VALUES (?, ?)', [id, name]);
        }
        res.json({ ok: true, count: features.length });
    } catch (err) {
        logError('[cars:features:put]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cars/:id/specs (replace all specs)
router.put('/:id/specs', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const specs = req.body.specs && typeof req.body.specs === 'object' ? req.body.specs : {};
        await query('DELETE FROM car_specs WHERE car_id = ?', [id]);
        for (const [k, v] of Object.entries(specs)) {
            const key = String(k).trim();
            const value = String(v ?? '').trim();
            if (!key) continue;
            await query('INSERT INTO car_specs (car_id, `key`, `value`) VALUES (?, ?, ?)', [id, key, value]);
        }
        res.json({ ok: true, count: Object.keys(specs).length });
    } catch (err) {
        logError('[cars:specs:put]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cars/:id/documents (upload documents)
router.post('/:id/documents', authMiddleware, requireRoles(['owner', 'admin', 'employee']), uploadDocs.array('files', 10), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const files = req.files || [];
        const docType = (req.body?.doc_type || null);
        const values = [];
        for (const f of files) {
            const url = `${uploadsBasePath}/${f.filename}`;
            values.push([id, url, f.originalname || null, docType]);
        }
        for (const v of values) {
            await query('INSERT INTO car_documents (car_id, url, filename, doc_type) VALUES (?, ?, ?, ?)', v);
        }
        res.status(201).json({ uploaded: values.length });
    } catch (err) {
        logError('[cars:docs:upload]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cars/:id/documents/:docId
router.delete('/:id/documents/:docId', authMiddleware, requireRoles(['owner', 'admin', 'employee']), async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const docId = parseInt(req.params.docId);
        const rows = await query('SELECT url FROM car_documents WHERE id = ? AND car_id = ?', [docId, id]);
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        const url = rows[0].url || '';
        await query('DELETE FROM car_documents WHERE id = ?', [docId]);
        if (typeof uploadsBasePath === 'string' && url.startsWith(`${uploadsBasePath}/`)) {
            const fp = path.join(uploadsDir, path.basename(url));
            fs.remove(fp).catch(() => { });
        }
        res.json({ ok: true });
    } catch (err) {
        logError('[cars:docs:delete]', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
