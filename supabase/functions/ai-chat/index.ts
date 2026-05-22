import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const API_KEY = Deno.env.get("OPENAI_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
    
    if (!API_KEY) {
      throw new Error("API_KEY is not configured");
    }

    const systemPrompt = `You are a compassionate and supportive AI assistant for Mindful Heaven, a mental health support platform. Your role is to:

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});