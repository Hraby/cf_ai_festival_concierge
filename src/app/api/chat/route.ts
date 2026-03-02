import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type Role = 'system' | 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

interface CloudflareBindings {
  AI: {
    run: (model: string, input: { messages: Message[] }) => Promise<{ response: string }>;
  };
  CHAT_HISTORY: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { message?: string; sessionId?: string };
    const { message, sessionId } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Missing message or sessionId' }, { status: 400 });
    }

    const env = process.env as unknown as CloudflareBindings;
    const AI = env.AI;
    const CHAT_HISTORY = env.CHAT_HISTORY;

    if (!AI || !CHAT_HISTORY) {
       return NextResponse.json({ error: 'Cloudflare Bindings not found' }, { status: 500 });
    }

    const kvData = await CHAT_HISTORY.get(sessionId);
    
    const messages: Message[] = kvData ? JSON.parse(kvData) : [];

    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: `You are a helpful, friendly digital concierge for ZlinFest, the largest children's film festival in the world. Answer user questions about the festival. Keep your answers concise, engaging, and in English.`
      });
    }

    messages.push({ role: 'user', content: message });

    const aiResponse = await AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: messages
    });

    messages.push({ role: 'assistant', content: aiResponse.response });

    await CHAT_HISTORY.put(sessionId, JSON.stringify(messages), { expirationTtl: 86400 });

    return NextResponse.json({ reply: aiResponse.response });

  } catch (error: unknown) {
    console.error('AI Chat API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}