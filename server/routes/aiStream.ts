import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';

const router = Router();

const SYSTEM_PROMPT = `You are a compassionate and supportive AI assistant for Mindful Heaven, a mental health support platform. Your role is to:

1. Provide empathetic, non-judgmental support to users discussing mental health topics
2. Suggest coping strategies, relaxation techniques, and self-care practices
3. Recommend relevant mental health resources when appropriate
4. Recognize signs of crisis and immediately redirect users to professional help

IMPORTANT GUIDELINES:
- Never diagnose mental health conditions
- Never prescribe or recommend specific medications
- Always encourage users to seek professional help for serious concerns
- Be warm, supportive, and understanding
- Validate users' feelings and experiences
- If a user mentions self-harm, suicide, or immediate danger, immediately provide crisis hotline information:
  * India: iCall (9152987821), Vandrevala Foundation (1860-2662-345)
  * International: Your local emergency services

Remember: You are a supportive companion, not a replacement for professional mental health care.`;

router.post('/', requireAuth, async (req, res) => {
  const schema = z.object({
    messages: z.array(
      z.object({ role: z.enum(['user', 'assistant']), content: z.string() })
    ),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service is not configured. Please add GEMINI_API_KEY in Secrets.' });
  }

  // Convert messages to Gemini format (assistant → model)
  const contents = parsed.data.messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.8 },
      }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    const errorBody = await upstream.json().catch(() => ({} as any));
    const code = errorBody?.error?.code;
    const status = upstream.status;

    if (status === 400 && errorBody?.error?.message?.includes('API key not valid')) {
      return res.status(401).json({ error: 'Invalid Gemini API key. Please check GEMINI_API_KEY in Secrets.' });
    }
    if (status === 429) {
      return res.status(429).json({ error: 'Gemini rate limit reached. Please try again in a moment.' });
    }
    if (status === 403) {
      return res.status(403).json({ error: 'Gemini API access denied. Ensure the API is enabled in Google Cloud.' });
    }
    console.error('Gemini gateway error:', status, errorBody);
    return res.status(500).json({ error: 'AI service temporarily unavailable.' });
  }

  // Stream back in OpenAI-compatible SSE format so the frontend needs no changes
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newlineIdx).replace(/\r$/, '');
        buffer = buffer.slice(newlineIdx + 1);

        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const chunk = JSON.parse(jsonStr);
          const text = chunk?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            // Emit in OpenAI-compatible SSE format
            const openaiChunk = { choices: [{ delta: { content: text } }] };
            res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (err) {
    console.error('Gemini stream pipe error:', err);
  } finally {
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

export default router;
