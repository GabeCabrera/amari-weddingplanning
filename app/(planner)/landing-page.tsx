"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export function LandingPage() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/concierge/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (data.requiresAuth) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I'd love to help you plan your wedding! Create a free account to continue our conversation and save your planning progress.",
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-warm-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-warm-100 bg-white">
        <Logo size="sm" href="/" />
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-warm-600 hover:text-warm-800 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm px-4 py-2 bg-warm-800 text-white rounded-full hover:bg-warm-900 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-rose-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-warm-800 text-center mb-3">
              Your AI wedding planner
            </h1>
            <p className="text-warm-500 text-center max-w-md mb-10">
              Ask me anything about planning your wedding — venues, budgets, timelines, or just vent about seating drama.
            </p>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {[
                "Help me figure out my wedding vibe",
                "What's a realistic budget for 100 guests?",
                "I'm overwhelmed, where do I start?",
                "How far in advance should I book vendors?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-white border border-warm-200 rounded-full text-sm text-warm-600 hover:border-warm-300 hover:bg-warm-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-warm-800 text-white rounded-br-md"
                      : "bg-white border border-warm-200 text-warm-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-warm-200 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {/* Sign up prompt after a few messages */}
            {messages.length >= 4 && (
              <div className="text-center py-4">
                <p className="text-sm text-warm-500 mb-3">
                  Create a free account to save your conversation and unlock all planning tools
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-warm-800 text-white text-sm rounded-full hover:bg-warm-900 transition-colors"
                >
                  Get started free
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-warm-100 bg-white">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about wedding planning..."
              className="flex-1 resize-none px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm max-h-32"
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="h-11 w-11 flex items-center justify-center bg-warm-800 hover:bg-warm-900 disabled:bg-warm-300 text-white rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-warm-400 text-center mt-3">
            Free to try · No account required to start
          </p>
        </div>
      </div>
    </main>
  );
}
