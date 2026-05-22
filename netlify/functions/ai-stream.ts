import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

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

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'AI service is not configured. Please add GROQ_API_KEY.' }),
    };
  }

  let messages: { role: string; content: string }[] = [];
  try {
    const body = JSON.parse(event.body || '{}');
    messages = body.messages ?? [];
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid input' }) };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        statusCode: response.status,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: (errorData as any).error?.message || 'Groq API error' }),
      };
    }

    // Proxy the stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let sseOutput = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      sseOutput += decoder.decode(value, { stream: true });
    }

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: sseOutput,
    };
  } catch (error: any) {
    console.error('Groq fetch error:', error);
    return {
      statusCode: 500,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to connect to Groq service' }),
    };
  }
};
