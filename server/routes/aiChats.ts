import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT id, title, created_at, updated_at FROM ai_chats WHERE user_id = $1 ORDER BY updated_at DESC',
    [req.auth!.userId]
  );
  res.json({ chats: result.rows });
});

router.post('/', requireAuth, async (req, res) => {
  const result = await query(
    `INSERT INTO ai_chats (user_id, title) VALUES ($1, 'New Chat')
       RETURNING id, title, created_at, updated_at`,
    [req.auth!.userId]
  );
  res.json({ chat: result.rows[0] });
});

router.patch('/:id', requireAuth, async (req, res) => {
  const schema = z.object({ title: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });
  const result = await query(
    `UPDATE ai_chats SET title = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3 RETURNING id, title`,
    [parsed.data.title, req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ chat: result.rows[0] });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const result = await query(
    'DELETE FROM ai_chats WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.get('/:id/messages', requireAuth, async (req, res) => {
  const owns = await query(
    'SELECT 1 FROM ai_chats WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (owns.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  const result = await query(
    `SELECT id, chat_id, role, content, created_at FROM ai_chat_messages
       WHERE chat_id = $1 ORDER BY created_at ASC`,
    [req.params.id]
  );
  res.json({ messages: result.rows });
});

router.post('/:id/messages', requireAuth, async (req, res) => {
  const schema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const owns = await query(
    'SELECT 1 FROM ai_chats WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (owns.rowCount === 0) return res.status(404).json({ error: 'Not found' });

  const result = await query(
    `INSERT INTO ai_chat_messages (chat_id, role, content)
       VALUES ($1, $2, $3) RETURNING id, chat_id, role, content, created_at`,
    [req.params.id, parsed.data.role, parsed.data.content]
  );
  await query('UPDATE ai_chats SET updated_at = now() WHERE id = $1', [
    req.params.id,
  ]);
  res.json({ message: result.rows[0] });
});

export default router;
