import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { generateAlias } from '../utils.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  let result = await query(
    'SELECT id, user_id, anonymous_alias, avatar_url, bio, notifications_enabled, created_at, updated_at FROM profiles WHERE user_id = $1',
    [userId]
  );
  if (result.rows.length === 0) {
    await query(
      'INSERT INTO profiles (user_id, anonymous_alias) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING',
      [userId, generateAlias()]
    );
    result = await query(
      'SELECT id, user_id, anonymous_alias, avatar_url, bio, notifications_enabled, created_at, updated_at FROM profiles WHERE user_id = $1',
      [userId]
    );
  }
  res.json({ profile: result.rows[0] });
});

const updateSchema = z.object({
  anonymous_alias: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  notifications_enabled: z.boolean().optional(),
});

router.put('/me', requireAuth, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const fields = parsed.data;
  const sets: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (fields.anonymous_alias !== undefined) {
    sets.push(`anonymous_alias = $${idx++}`);
    values.push(fields.anonymous_alias.trim());
  }
  if (fields.bio !== undefined) {
    sets.push(`bio = $${idx++}`);
    values.push(fields.bio);
  }
  if (fields.avatar_url !== undefined) {
    sets.push(`avatar_url = $${idx++}`);
    values.push(fields.avatar_url);
  }
  if (fields.notifications_enabled !== undefined) {
    sets.push(`notifications_enabled = $${idx++}`);
    values.push(fields.notifications_enabled);
  }
  sets.push(`updated_at = now()`);
  values.push(req.auth!.userId);

  await query(
    `UPDATE profiles SET ${sets.join(', ')} WHERE user_id = $${idx}`,
    values
  );
  const result = await query(
    'SELECT id, user_id, anonymous_alias, avatar_url, bio, notifications_enabled FROM profiles WHERE user_id = $1',
    [req.auth!.userId]
  );
  res.json({ profile: result.rows[0] });
});

router.get('/all', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT user_id, anonymous_alias, avatar_url
       FROM profiles
       WHERE user_id <> $1
       ORDER BY anonymous_alias ASC`,
    [req.auth!.userId]
  );
  res.json({ profiles: result.rows });
});

router.post('/by-ids', requireAuth, async (req, res) => {
  const schema = z.object({ user_ids: z.array(z.string().uuid()) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  if (parsed.data.user_ids.length === 0) {
    return res.json({ profiles: [] });
  }
  const result = await query(
    'SELECT user_id, anonymous_alias, avatar_url FROM profiles WHERE user_id = ANY($1::uuid[])',
    [parsed.data.user_ids]
  );
  res.json({ profiles: result.rows });
});

router.delete('/me', requireAuth, async (req, res) => {
  // Cascading deletes from users will remove all related rows
  await query('DELETE FROM users WHERE id = $1', [req.auth!.userId]);
  res.clearCookie('mh_session', { path: '/' });
  res.json({ ok: true });
});

export default router;
