# Project Overview

Mindful Heaven — a mental health support web app rewritten to run entirely on Replit's built-in PostgreSQL database with a custom Express auth backend (no Supabase). Anonymous peer support, AI chat, mood journaling, community forum, private messaging, and counselor directory.

## Stack
- Build tool: Vite 5
- Framework: React 18 + TypeScript
- UI: shadcn/ui (Radix primitives) + Tailwind CSS
- Routing: react-router-dom v6
- State: @tanstack/react-query
- Backend: Express 5 (TypeScript via tsx) on port 3001
- Database: Replit PostgreSQL via `pg` (DATABASE_URL secret)
- Auth: bcrypt password hashing + JWT in httpOnly `mh_session` cookie (30-day expiry)
- File uploads: multer disk storage to `uploads/{avatars,messages}/{userId}/`
- AI: OpenAI streaming (SSE) — requires `OPENAI_API_KEY` secret to enable AI chat
- Package manager: npm

## Project Structure
- `src/` — frontend React app
  - `pages/` — route components (Auth, Dashboard, dashboard/{Forum,Messages,AIChat,MoodJournal,Notifications,Settings,...})
  - `contexts/AuthContext.tsx` — cookie-session based auth context
  - `integrations/api/client.ts` — typed API client wrapping all backend endpoints
  - `components/ui/` — shadcn components
- `server/` — Express backend (TypeScript, run via `tsx`)
  - `index.ts` — boot, schema apply, route mounting, serves `/uploads` and `dist/`
  - `db.ts` — pg pool
  - `auth.ts` — JWT cookie middleware, bcrypt helpers
  - `utils.ts` — shared helpers (alias generation, sha256 for security answers)
  - `schema.sql` — full PostgreSQL schema applied on boot (idempotent)
  - `routes/` — auth, profiles, forum, peerChats, moodLogs, notifications, aiChats, aiStream, security, uploads
- `uploads/` — runtime upload destination (avatars, messages)
- `vite.config.ts` — proxies `/api` and `/uploads` to `127.0.0.1:3001`

## Replit Setup
- Workflow `Start application` runs `npm run dev` which uses `concurrently` to launch:
  - `dev:api` → `tsx watch server/index.ts` (Express on :3001)
  - `dev:web` → `vite` (frontend on :5000)
- Vite dev server: `host: 0.0.0.0`, `port: 5000`, `allowedHosts: true`.
- Production: `npm run build` builds the frontend, `npm start` runs `tsx server/index.ts` which serves both `/api` and the built `dist/` SPA.
- Deployment must use `autoscale` or `reserved-vm` (NOT static) since the backend is required at runtime.

## Environment Variables (Secrets)
- `DATABASE_URL` — Replit PostgreSQL connection string (required, set automatically)
- `JWT_SECRET` — JWT signing secret (has dev fallback; should be set in production)
- `OPENAI_API_KEY` — optional; if missing, the AI chat endpoint returns 503

## Database Schema
Tables (auto-created on boot from `server/schema.sql`):
- `users` — id, email, password_hash
- `profiles` — anonymous_alias, avatar_url, bio, notifications_enabled
- `security_questions` — sha256-hashed answers for password recovery
- `mood_logs`, `forum_posts`, `forum_replies`
- `peer_chats`, `peer_messages`, `deleted_conversations`
- `notifications`
- `ai_chats`, `ai_messages`

## Auth Flow
- Signup: POST `/api/auth/signup` → bcrypt password, creates user + profile with random alias, sets cookie
- Signin: POST `/api/auth/signin`
- Session: cookie `mh_session` (httpOnly, 30d) — verified by middleware on protected routes
- Forgot password: 2 security questions (sha256-hashed answers, lowercase-trimmed) via `/api/security/*`

## Key Behaviors
- Profile is auto-created on signup AND lazy-created on first GET `/api/profiles/me`
- Forum replies and peer messages insert notifications server-side (respecting `notifications_enabled`)
- AI chat: messages sent to `/api/ai-stream` proxy raw OpenAI SSE bytes back; client parses and saves user/assistant messages via `/api/ai-chats/{id}/messages`
- Uploads: `uploadsApi.upload('avatars'|'messages', file)` returns `{url}` like `/uploads/...`. Both image and video go to `messages` bucket.
