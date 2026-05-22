import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const chatsRes = await query(
    `SELECT c.id, c.participant1_id, c.participant2_id, c.created_at, c.updated_at,
            pr.user_id AS other_user_id,
            pr.anonymous_alias AS other_alias,
            pr.avatar_url AS other_avatar
       FROM peer_chats c
       LEFT JOIN LATERAL (
         SELECT user_id, anonymous_alias, avatar_url
           FROM profiles
           WHERE user_id = CASE WHEN c.participant1_id = $1 THEN c.participant2_id ELSE c.participant1_id END
       ) pr ON true
       WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
         AND NOT EXISTS (
           SELECT 1 FROM deleted_conversations dc WHERE dc.user_id = $1 AND dc.chat_id = c.id
         )
       ORDER BY c.updated_at DESC`,
    [userId]
  );

  const chatIds = chatsRes.rows.map((c: any) => c.id);
  let lastMessages: Record<string, any> = {};
  if (chatIds.length > 0) {
    const lastRes = await query(
      `SELECT DISTINCT ON (chat_id) chat_id, content, image_url, video_url
         FROM peer_messages
         WHERE chat_id = ANY($1::uuid[]) AND deleted_for_everyone = false
         ORDER BY chat_id, created_at DESC`,
      [chatIds]
    );
    for (const m of lastRes.rows as any[]) {
      lastMessages[m.chat_id] = m.video_url
        ? '🎥 Video'
        : m.image_url
        ? '📷 Image'
        : m.content;
    }
  }

  const chats = chatsRes.rows.map((c: any) => ({
    id: c.id,
    participant1_id: c.participant1_id,
    participant2_id: c.participant2_id,
    created_at: c.created_at,
    updated_at: c.updated_at,
    other_user: c.other_user_id
      ? {
          user_id: c.other_user_id,
          anonymous_alias: c.other_alias,
          avatar_url: c.other_avatar,
        }
      : null,
    last_message: lastMessages[c.id] || null,
  }));
  res.json({ chats });
});

router.post('/start', requireAuth, async (req, res) => {
  const schema = z.object({ other_user_id: z.string().uuid() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const me = req.auth!.userId;
  const other = parsed.data.other_user_id;
  if (me === other)
    return res.status(400).json({ error: 'Cannot start a chat with yourself' });

  // Try to find existing chat in either direction
  const existing = await query(
    `SELECT id FROM peer_chats
       WHERE (participant1_id = $1 AND participant2_id = $2)
          OR (participant1_id = $2 AND participant2_id = $1)
       LIMIT 1`,
    [me, other]
  );

  let chatId: string;
  if (existing.rows.length > 0) {
    chatId = existing.rows[0].id;
    // Restore from deleted_conversations
    await query(
      'DELETE FROM deleted_conversations WHERE user_id = $1 AND chat_id = $2',
      [me, chatId]
    );
  } else {
    const insRes = await query(
      `INSERT INTO peer_chats (participant1_id, participant2_id)
         VALUES ($1, $2) RETURNING id, participant1_id, participant2_id, created_at, updated_at`,
      [me, other]
    );
    chatId = insRes.rows[0].id;
  }

  const fullRes = await query(
    `SELECT c.id, c.participant1_id, c.participant2_id, c.created_at, c.updated_at,
            pr.user_id AS other_user_id,
            pr.anonymous_alias AS other_alias,
            pr.avatar_url AS other_avatar
       FROM peer_chats c
       LEFT JOIN profiles pr ON pr.user_id = $2
       WHERE c.id = $1`,
    [chatId, other]
  );
  const c: any = fullRes.rows[0];
  res.json({
    chat: {
      id: c.id,
      participant1_id: c.participant1_id,
      participant2_id: c.participant2_id,
      created_at: c.created_at,
      updated_at: c.updated_at,
      other_user: c.other_user_id
        ? { user_id: c.other_user_id, anonymous_alias: c.other_alias, avatar_url: c.other_avatar }
        : null,
    },
  });
});

router.get('/:chatId/messages', requireAuth, async (req, res) => {
  const userId = req.auth!.userId;
  const chatRes = await query(
    'SELECT participant1_id, participant2_id FROM peer_chats WHERE id = $1',
    [req.params.chatId]
  );
  if (chatRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const c = chatRes.rows[0];
  if (c.participant1_id !== userId && c.participant2_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const msgRes = await query(
    `SELECT id, chat_id, sender_id, content, image_url, video_url, deleted_for_sender,
            deleted_for_everyone, created_at
       FROM peer_messages
       WHERE chat_id = $1
         AND deleted_for_everyone = false
         AND NOT (sender_id = $2 AND deleted_for_sender = true)
       ORDER BY created_at ASC`,
    [req.params.chatId, userId]
  );
  res.json({ messages: msgRes.rows });
});

router.post('/:chatId/messages', requireAuth, async (req, res) => {
  const schema = z.object({
    content: z.string().default(''),
    image_url: z.string().nullable().optional(),
    video_url: z.string().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const userId = req.auth!.userId;
  const chatRes = await query(
    'SELECT participant1_id, participant2_id FROM peer_chats WHERE id = $1',
    [req.params.chatId]
  );
  if (chatRes.rows.length === 0) return res.status(404).json({ error: 'Not found' });
  const c = chatRes.rows[0];
  if (c.participant1_id !== userId && c.participant2_id !== userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const insRes = await query(
    `INSERT INTO peer_messages (chat_id, sender_id, content, image_url, video_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, chat_id, sender_id, content, image_url, video_url, created_at`,
    [
      req.params.chatId,
      userId,
      parsed.data.content || '',
      parsed.data.image_url || null,
      parsed.data.video_url || null,
    ]
  );

  await query('UPDATE peer_chats SET updated_at = now() WHERE id = $1', [
    req.params.chatId,
  ]);

  // Notify receiver
  const receiverId =
    c.participant1_id === userId ? c.participant2_id : c.participant1_id;
  const profRes = await query<{
    sender_alias: string;
    notifications_enabled: boolean;
  }>(
    `SELECT (SELECT anonymous_alias FROM profiles WHERE user_id = $1) AS sender_alias,
            COALESCE((SELECT notifications_enabled FROM profiles WHERE user_id = $2), true) AS notifications_enabled`,
    [userId, receiverId]
  );
  const senderAlias = profRes.rows[0]?.sender_alias || 'Someone';
  const enabled = profRes.rows[0]?.notifications_enabled ?? true;
  if (enabled) {
    const previewMsg = parsed.data.video_url
      ? '🎥 Sent a video'
      : parsed.data.image_url
      ? '📷 Sent an image'
      : (parsed.data.content || '').slice(0, 100);
    await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
         VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        receiverId,
        `New message from ${senderAlias}`,
        previewMsg,
        'message',
        req.params.chatId,
        'peer_chat',
      ]
    );
  }

  res.json({ message: insRes.rows[0] });
});

router.patch('/messages/:id/delete-for-me', requireAuth, async (req, res) => {
  const result = await query(
    `UPDATE peer_messages SET deleted_for_sender = true
       WHERE id = $1 AND sender_id = $2`,
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.delete('/messages/:id', requireAuth, async (req, res) => {
  const result = await query(
    `DELETE FROM peer_messages WHERE id = $1 AND sender_id = $2`,
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.post('/:chatId/delete-for-me', requireAuth, async (req, res) => {
  await query(
    `INSERT INTO deleted_conversations (user_id, chat_id) VALUES ($1, $2)
       ON CONFLICT (user_id, chat_id) DO NOTHING`,
    [req.auth!.userId, req.params.chatId]
  );
  res.json({ ok: true });
});

export default router;
