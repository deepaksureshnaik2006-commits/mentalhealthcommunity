import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';
import { hashSecurityAnswer } from '../utils.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const result = await query(
    'SELECT question1, question2 FROM security_questions WHERE user_id = $1',
    [req.auth!.userId]
  );
  res.json({ questions: result.rows[0] || null });
});

router.put('/me', requireAuth, async (req, res) => {
  const schema = z.object({
    question1: z.string().min(1),
    answer1: z.string().min(1),
    question2: z.string().min(1),
    answer2: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const a1 = hashSecurityAnswer(parsed.data.answer1);
  const a2 = hashSecurityAnswer(parsed.data.answer2);

  await query(
    `INSERT INTO security_questions (user_id, question1, answer1_hash, question2, answer2_hash)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE
         SET question1 = EXCLUDED.question1,
             answer1_hash = EXCLUDED.answer1_hash,
             question2 = EXCLUDED.question2,
             answer2_hash = EXCLUDED.answer2_hash,
             updated_at = now()`,
    [req.auth!.userId, parsed.data.question1, a1, parsed.data.question2, a2]
  );
  res.json({ ok: true });
});

router.post('/get-questions', async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email' });
  const email = parsed.data.email.trim().toLowerCase();

  const userRes = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
    email,
  ]);
  if (userRes.rows.length === 0) {
    return res.json({ error: 'no_questions' });
  }
  const sqRes = await query<{ question1: string; question2: string }>(
    'SELECT question1, question2 FROM security_questions WHERE user_id = $1',
    [userRes.rows[0].id]
  );
  if (sqRes.rows.length === 0) {
    return res.json({ error: 'no_questions' });
  }
  res.json({ question1: sqRes.rows[0].question1, question2: sqRes.rows[0].question2 });
});

router.post('/verify-answers', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    answer1: z.string().min(1),
    answer2: z.string().min(1),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ verified: false, error: 'Invalid input' });

  const email = parsed.data.email.trim().toLowerCase();
  const userRes = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
    email,
  ]);
  if (userRes.rows.length === 0)
    return res.json({ verified: false, error: 'Invalid credentials' });

  const sqRes = await query<{ answer1_hash: string; answer2_hash: string }>(
    'SELECT answer1_hash, answer2_hash FROM security_questions WHERE user_id = $1',
    [userRes.rows[0].id]
  );
  if (sqRes.rows.length === 0)
    return res.json({ verified: false, error: 'No security questions set' });

  const a1 = hashSecurityAnswer(parsed.data.answer1);
  const a2 = hashSecurityAnswer(parsed.data.answer2);
  const ok =
    a1 === sqRes.rows[0].answer1_hash && a2 === sqRes.rows[0].answer2_hash;

  res.json({ verified: ok, ...(ok ? {} : { error: 'Security answers are incorrect.' }) });
});

router.post('/verify-and-reset', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    answer1: z.string().min(1),
    answer2: z.string().min(1),
    newPassword: z.string().min(6),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const email = parsed.data.email.trim().toLowerCase();
  const userRes = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [
    email,
  ]);
  if (userRes.rows.length === 0) return res.json({ error: 'Invalid credentials' });

  const sqRes = await query<{ answer1_hash: string; answer2_hash: string }>(
    'SELECT answer1_hash, answer2_hash FROM security_questions WHERE user_id = $1',
    [userRes.rows[0].id]
  );
  if (sqRes.rows.length === 0)
    return res.json({ error: 'No security questions set up.' });

  const a1 = hashSecurityAnswer(parsed.data.answer1);
  const a2 = hashSecurityAnswer(parsed.data.answer2);
  if (a1 !== sqRes.rows[0].answer1_hash || a2 !== sqRes.rows[0].answer2_hash) {
    return res.json({ error: 'Security answers are incorrect.' });
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    hash,
    userRes.rows[0].id,
  ]);
  res.json({ ok: true });
});

export default router;
