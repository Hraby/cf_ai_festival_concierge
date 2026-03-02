"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
	role: "user" | "assistant";
	content: string;
};

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([
		{ role: "assistant", content: "Hi there! I'm the ZlinFest digital concierge. How can I help you with the festival today?" }
	]);
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
				console.error("API Error:", data.error);
				setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to the festival servers." }]);
			}

			if (response.ok && data.reply) {
				const aiReply = data.reply;
				setMessages((prev) => [
					...prev, 
					{ role: "assistant", content: aiReply }
				]);
			} else {
				console.error("API Error:", data.error);
				setMessages((prev) => [
					...prev, 
					{ role: "assistant", content: "I'm sorry, I couldn't process that. Please try again." }
				]);
			}
		} catch (error) {
			console.error("Fetch Error:", error);
			setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
		} finally {
			setIsLoading(false);
		}
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]">
        
        <div className="bg-blue-600 p-4 text-white flex items-center gap-3">
          <Bot size={28} />
          <div>
            <h1 className="text-xl font-bold">ZlinFest Concierge</h1>
            <p className="text-xs text-blue-200">Powered by Cloudflare Workers AI</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"}`}>
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} />
                </div>
                <div className="p-3 rounded-2xl bg-white border border-gray-200 text-gray-800 rounded-tl-none flex items-center">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={sendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about movies, tickets, or schedules..."
              className="test-black-700 flex-1 p-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </main>
  );
}