import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT id, user_id, title, message, type, read, reference_id, reference_type, created_at
       FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.auth!.userId]
  );
  res.json({ notifications: result.rows });
});

router.get('/unread-count', requireAuth, async (req, res) => {
  const result = await query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM notifications WHERE user_id = $1 AND read = false',
    [req.auth!.userId]
  );
  res.json({ count: parseInt(result.rows[0].count, 10) });
});

router.patch('/:id/read', requireAuth, async (req, res) => {
  await query(
    'UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  res.json({ ok: true });
});

router.patch('/mark-all-read', requireAuth, async (req, res) => {
  await query(
    'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
    [req.auth!.userId]
  );
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  res.json({ ok: true });
});

export default router;
