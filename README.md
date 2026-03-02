# 🎡 cf_ai_festival_concierge

An AI-powered digital concierge for ZlinFest (International Film Festival for Children and Youth). This application serves as a high-end, localized assistant for festival visitors, built entirely on the Cloudflare ecosystem.

**Live Demo:** https://cf-ai-festival-concierge.hrabyyt.workers.dev/

## 🚀 Key Features
- **Intelligent Multilingual Support:** Automatically detects browser language (CS/EN) and adapts the UI and AI personality instantly.
- **Persistent Memory:** Utilizes Cloudflare KV to maintain chat history across sessions using unique session identifiers.
- **Edge Performance:** Running on Cloudflare Pages with Edge Runtime for sub-second response times globally.

## 🛠️ Architecture & Requirements (Cloudflare Stack)

This project strictly follows the assignment requirements:
1.  **LLM:** Powered by **Llama 3.3 (70B/8B)** via **Cloudflare Workers AI**.
2.  **Workflow / Coordination:** Orchestrated using **Cloudflare Pages Functions** and the **OpenNext** adapter for Next.js 16.
3.  **User Input:** Interactive chat interface built with **React 19** and **Lucide Icons**.
4.  **Memory / State:** **Cloudflare KV** (Key-Value storage) handles the persistent state of conversations.

## 📂 Project Structure
- `src/app/api/chat/route.ts`: Edge API route handling LLM orchestration and KV state.
- `src/app/page.tsx`: Premium chat interface with auto-language detection.
- `PROMPTS.md`: Detailed log of AI-assisted development steps.
- `wrangler.jsonc`: Cloudflare configuration for bindings.

## 🛠️ Local Development

### 1. Prerequisites
- Node.js (v20+)
- Cloudflare Account & Wrangler CLI

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/hraby/cf_ai_festival_concierge
cd cf_ai_festival_concierge

# Install dependencies
npm install

# Create KV Namespace
npx wrangler kv namespace create CHAT_HISTORY