import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from './auth.js';
import { logError } from '../logger.js';

const router = express.Router();

// GET /api/favorites -> list current user's favorite cars (only existing cars)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await query(
      `SELECT c.id, c.title, c.make, c.model, c.year, c.price, c.mileage, c.fuel_type, c.transmission, c.body_type, c.color, c.featured,
              (SELECT url FROM car_media m WHERE m.car_id = c.id AND m.type = 'image' ORDER BY m.id ASC LIMIT 1) AS thumb_url,
              f.created_at AS favorited_at
         FROM user_favorites f
         JOIN cars c ON c.id = f.car_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC`,
      [userId]
    );
    res.json({ items: rows });
  } catch (err) {
    logError('[favorites:list]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/favorites/:carId -> check if car is favorited
router.get('/:carId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const carId = Number(req.params.carId);
    if (!Number.isFinite(carId)) return res.status(400).json({ error: 'Invalid car id' });

    const rows = await query('SELECT 1 FROM user_favorites WHERE user_id = ? AND car_id = ? LIMIT 1', [userId, carId]);
    res.json({ favorite: rows.length > 0 });
  } catch (err) {
    logError('[favorites:status]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/favorites/:carId -> add to favorites
router.post('/:carId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const carId = Number(req.params.carId);
    if (!Number.isFinite(carId)) return res.status(400).json({ error: 'Invalid car id' });

    // Ensure car exists
    const cars = await query('SELECT id FROM cars WHERE id = ? LIMIT 1', [carId]);
    if (!cars.length) return res.status(404).json({ error: 'Car not found' });

    // Insert ignore to avoid duplicate PK(user_id, car_id)
    await query('INSERT IGNORE INTO user_favorites (user_id, car_id) VALUES (?, ?)', [userId, carId]);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[favorites:add] user=${userId} car=${carId}`);
    }

    res.status(201).json({ ok: true });
  } catch (err) {
    logError('[favorites:add]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/favorites/:carId -> remove from favorites
router.delete('/:carId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const carId = Number(req.params.carId);
    if (!Number.isFinite(carId)) return res.status(400).json({ error: 'Invalid car id' });

    const result = await query('DELETE FROM user_favorites WHERE user_id = ? AND car_id = ?', [userId, carId]);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[favorites:remove] user=${userId} car=${carId}`);
    }

    res.json({ ok: true, deleted: result.affectedRows > 0 });
  } catch (err) {
    logError('[favorites:remove]', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
