import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, withTransaction } from '../db.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth,
  readToken,
} from '../auth.js';
import { generateAlias } from '../utils.js';

const router = Router();

const credSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/signup', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res
      .status(400)
      .json({ error: 'This email is already registered. Please sign in instead.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await withTransaction(async (client) => {
      const userResult = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, passwordHash]
      );
      const newUser = userResult.rows[0];
      await client.query(
        'INSERT INTO profiles (user_id, anonymous_alias) VALUES ($1, $2)',
        [newUser.id, generateAlias()]
      );
      return newUser;
    });

    const token = signToken({ userId: user.id, email: user.email });
    setAuthCookie(res, token);
    res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/signin', async (req, res) => {
  const parsed = credSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  const result = await query<{
    id: string;
    email: string;
    password_hash: string;
  }>('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }

  const user = result.rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }

  const token = signToken({ userId: user.id, email: user.email });
  setAuthCookie(res, token);
  res.json({ user: { id: user.id, email: user.email } });
});

router.post('/signout', (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  const payload = readToken(req);
  if (!payload) return res.json({ user: null });
  res.json({ user: { id: payload.userId, email: payload.email } });
});

router.post('/change-password', requireAuth, async (req, res) => {
  const schema = z.object({ password: z.string().min(6) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const hash = await bcrypt.hash(parsed.data.password, 10);
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [
    hash,
    req.auth!.userId,
  ]);
  res.json({ ok: true });
});

export default router;
