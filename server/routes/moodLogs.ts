import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT id, user_id, mood, notes, created_at FROM mood_logs WHERE user_id = $1 ORDER BY created_at DESC',
    [req.auth!.userId]
  );
  res.json({ logs: result.rows });
});

router.post('/', requireAuth, async (req, res) => {
  const schema = z.object({
    mood: z.string().min(1),
    notes: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const result = await query(
    'INSERT INTO mood_logs (user_id, mood, notes) VALUES ($1, $2, $3) RETURNING id',
    [req.auth!.userId, parsed.data.mood, parsed.data.notes ?? null]
  );
  res.json({ id: result.rows[0].id });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const result = await query(
    'DELETE FROM mood_logs WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
