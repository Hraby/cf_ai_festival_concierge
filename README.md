# cf_ai_festival_concierge

Digital concierge for ZlinFest 2026. Built on Cloudflare Workers AI and Next.js.

[Live Demo](https://cf-ai-festival-concierge.hrabyyt.workers.dev/)

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Cloudflare Pages (Edge)
- **LLM**: Llama 3.3 (70B/8B) via Workers AI
- **State**: Cloudflare KV
- **Deployment**: OpenNext

## Features
- **Language Detection**: Automatic UI/LLM localization based on browser headers.
- **Session Persistence**: Chat history maintained via KV store.
- **Edge Native**: Zero-latency global delivery.

## Local Development

### Prerequisites
- Node.js 20+
- Wrangler CLI

### Setup
```bash
git clone [https://github.com/hraby/cf_ai_festival_concierge](https://github.com/hraby/cf_ai_festival_concierge)
cd cf_ai_festival_concierge
npm install

```

### Infrastructure

```bash
# Create the required KV namespace
npx wrangler kv namespace create CHAT_HISTORY

```

### Running

```bash
npm run dev

```

## Structure

* `src/app/api/chat/route.ts` - LLM orchestration and state management.
* `src/app/page.tsx` - Chat interface and client-side localization.
* `PROMPTS.md` - Development logs and AI prompt history.
* `wrangler.jsonc` - Cloudflare configuration.
