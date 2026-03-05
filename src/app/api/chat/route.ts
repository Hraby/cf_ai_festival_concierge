import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { message?: string; sessionId?: string };
    const { message, sessionId } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let env: any;
    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 });
    }

    try {
      const cf = getCloudflareContext();
      env = cf.env;
    } catch (e) {
      console.log("Bridge not ready, using process.env as fallback");
      env = process.env;
    }
    const AI = env.AI;
    const CHAT_HISTORY = env.CHAT_HISTORY;

    console.log("AI check:", !!AI);
    console.log("KV check:", !!CHAT_HISTORY);

    if (!AI || !CHAT_HISTORY) {
      return NextResponse.json({ error: 'Cloudflare Bindings not found in context' }, { status: 500 });
    }

    const kvData = await CHAT_HISTORY.get(sessionId);
    const messages = kvData ? JSON.parse(kvData) : [];

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: "You are a friendly digital concierge for ZlinFest. Detect the user's language (Czech or English) and respond in the same language. Be concise, helpful, and enthusiastic about films and the festival program."
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('CRITICAL API ERROR:', error.message);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}