"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, User, Loader2, ArrowUpCircle, Globe } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const translations = {
  cs: {
    welcome: "Vítejte na ZlinFestu. Jsem váš digitální průvodce. S čím vám mohu dnes pomoci?",
    placeholder: "Zeptejte se na cokoliv...",
    visitor: "Návštěvník",
    concierge: "AI Asistent",
    loading: "Připravuji odpověď...",
    error: "Došlo k chybě. Zkuste to znovu.",
    connection: "Ztráto spojení.",
    status: "Živý program",
    support: "Podpora"
  },
  en: {
    welcome: "Welcome to ZlinFest. I'm your digital concierge. How can I help you today?",
    placeholder: "Ask anything about the festival...",
    visitor: "Visitor",
    concierge: "AI Concierge",
    loading: "Generating response...",
    error: "An error occurred. Please try again.",
    connection: "Connection lost.",
    status: "Live Program",
    support: "Support"
  }
};
export default function Home() {
  const [lang, setLang] = useState<"cs" | "en">("en");
  const t = translations[lang];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(2, 15));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
	const browserLang = navigator.language.toLowerCase();
	const detectedLang = browserLang.startsWith("cs") ? "cs" : "en";
	
	setLang(detectedLang);
	setSessionId(Math.random().toString(36).substring(2, 15));
    setMessages([
		{ 
		role: "assistant", 
		content: translations[detectedLang].welcome
		}
	]);
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: t.error }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: t.connection }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-white bg-glow text-black">
      
      <nav className="fixed top-0 z-30 flex w-full max-w-5xl items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
            <Sparkles size={18} fill="white" />
          </div>
          <span className="text-sm font-semibold tracking-tight">ZlinFest <span className="text-gray-400 font-normal">{t.concierge}</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === "cs" ? "en" : "cs")}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-amber-600 transition-colors"
          >
            <Globe size={14} />
            {lang === "cs" ? "English" : "Čeština"}
          </button>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <button className="rounded-full bg-gray-900 px-3 py-1 text-[11px] font-bold text-white hover:bg-gray-800 transition-all uppercase tracking-wider">
            {t.support}
          </button>
        </div>
      </nav>

      <div className="flex w-full max-w-3xl flex-1 flex-col pt-24 pb-32 px-4">
        <div className="space-y-8">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
              <div className="flex w-full gap-4 px-2">
                <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-100 shadow-sm
                  ${msg.role === "user" ? "bg-gray-50 text-gray-400" : "bg-amber-50 text-amber-600"}`}>
                  {msg.role === "user" ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-300">
                    {msg.role === "user" ? t.visitor : t.concierge}
                  </span>
                  <p className="text-[15px] leading-7 text-gray-700 font-medium whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 px-2 opacity-40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                <Loader2 size={14} className="animate-spin text-amber-600" />
              </div>
              <span className="text-[13px] font-medium text-gray-400 mt-1.5">{t.loading}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="fixed bottom-8 w-full max-w-2xl px-4">
        <div className="chat-shadow relative flex items-center rounded-2xl bg-white/90 backdrop-blur-md p-1.5 border border-gray-100 focus-within:ring-4 focus-within:ring-amber-500/5 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(e)}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-300 font-medium"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-950 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-10 disabled:grayscale"
          >
            <ArrowUpCircle size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}