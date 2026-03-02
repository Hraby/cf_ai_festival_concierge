import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { message?: string; sessionId?: string };
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const env = process.env as any;
    const AI = env.AI;
    const CHAT_HISTORY = env.CHAT_HISTORY;

    console.log("Binding AI exists:", !!AI);
    console.log("Binding KV exists:", !!CHAT_HISTORY);

    if (!AI || !CHAT_HISTORY) {
      throw new Error("Cloudflare Bindings are missing. Did you add them in the Dashboard and Redeployed?");
    }

    const kvData = await CHAT_HISTORY.get(sessionId);
    const messages = kvData ? JSON.parse(kvData) : [];

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: "You are a friendly ZlinFest guide. Keep it short."
      });
    }
    messages.push({ role: 'user', content: message });

    const aiResponse = await AI.run('@cf/meta/llama-3-8b-instruct', {
      messages: messages
    });

    const answer = aiResponse.response;
    messages.push({ role: 'assistant', content: answer });

    await CHAT_HISTORY.put(sessionId, JSON.stringify(messages), { expirationTtl: 86400 });

    return NextResponse.json({ reply: answer });

  } catch (err: any) {
    console.error("Critical API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}