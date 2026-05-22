import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

router.get('/posts', requireAuth, async (_req, res) => {
  const postsRes = await query(
    `SELECT p.id, p.user_id, p.title, p.content, p.category, p.created_at,
            pr.anonymous_alias AS author_alias,
            COALESCE(rc.cnt, 0)::int AS reply_count
       FROM forum_posts p
       LEFT JOIN profiles pr ON pr.user_id = p.user_id
       LEFT JOIN (
         SELECT post_id, COUNT(*)::int AS cnt FROM forum_replies GROUP BY post_id
       ) rc ON rc.post_id = p.id
       ORDER BY p.created_at DESC`
  );
  res.json({ posts: postsRes.rows });
});

router.post('/posts', requireAuth, async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    category: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const result = await query(
    `INSERT INTO forum_posts (user_id, title, content, category)
       VALUES ($1, $2, $3, $4) RETURNING id`,
    [req.auth!.userId, parsed.data.title.trim(), parsed.data.content.trim(), parsed.data.category]
  );
  res.json({ id: result.rows[0].id });
});

router.delete('/posts/:id', requireAuth, async (req, res) => {
  const result = await query(
    'DELETE FROM forum_posts WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.get('/posts/:id/replies', requireAuth, async (req, res) => {
  const result = await query(
    `SELECT r.id, r.post_id, r.user_id, r.content, r.created_at,
            pr.anonymous_alias AS author_alias
       FROM forum_replies r
       LEFT JOIN profiles pr ON pr.user_id = r.user_id
       WHERE r.post_id = $1
       ORDER BY r.created_at ASC`,
    [req.params.id]
  );
  res.json({ replies: result.rows });
});

router.post('/posts/:id/replies', requireAuth, async (req, res) => {
  const schema = z.object({ content: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const postRes = await query<{ user_id: string; title: string }>(
    'SELECT user_id, title FROM forum_posts WHERE id = $1',
    [req.params.id]
  );
  if (postRes.rows.length === 0) return res.status(404).json({ error: 'Post not found' });

  const replyRes = await query(
    `INSERT INTO forum_replies (post_id, user_id, content)
       VALUES ($1, $2, $3) RETURNING id`,
    [req.params.id, req.auth!.userId, parsed.data.content.trim()]
  );

  // Notify post owner if different and notifications enabled
  const post = postRes.rows[0];
  if (post.user_id !== req.auth!.userId) {
    const profRes = await query<{
      anonymous_alias: string;
      notifications_enabled: boolean;
    }>(
      `SELECT (SELECT anonymous_alias FROM profiles WHERE user_id = $1) AS anonymous_alias,
              COALESCE((SELECT notifications_enabled FROM profiles WHERE user_id = $2), true) AS notifications_enabled`,
      [req.auth!.userId, post.user_id]
    );
    const replierAlias = profRes.rows[0]?.anonymous_alias || 'Someone';
    const enabled = profRes.rows[0]?.notifications_enabled ?? true;
    if (enabled) {
      await query(
        `INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
           VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          post.user_id,
          'New reply to your post',
          `${replierAlias} replied to "${post.title.slice(0, 50)}"`,
          'forum',
          req.params.id,
          'forum_post',
        ]
      );
    }
  }

  res.json({ id: replyRes.rows[0].id });
});

router.delete('/replies/:id', requireAuth, async (req, res) => {
  const result = await query(
    'DELETE FROM forum_replies WHERE id = $1 AND user_id = $2',
    [req.params.id, req.auth!.userId]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

export default router;
