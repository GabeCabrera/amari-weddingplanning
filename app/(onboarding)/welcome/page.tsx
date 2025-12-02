"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function WelcomePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial greeting from Hera
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          role: "assistant",
          content: "Hey! I'm Hera. I'm here to help you plan your wedding.\n\nTell me a little about what you're envisioning — or just say hi 👋",
        },
      ]);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input
  useEffect(() => {
    if (messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [messages.length]);

  // Show continue button after a few exchanges
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    if (userMessages >= 2) {
      setShowContinue(true);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          isOnboarding: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I had trouble responding. Try again?" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContinue = async () => {
    // Mark onboarding as complete
    await fetch("/api/settings/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingComplete: true }),
    });
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-warm-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-warm-100 bg-white">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Logo size="sm" href={undefined} />
          {showContinue && (
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 text-sm text-warm-600 hover:text-warm-800 transition-colors"
            >
              Continue to planner
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-warm-800 text-white rounded-3xl rounded-br-lg px-5 py-3"
                      : "text-warm-800"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-1 py-2">
                  <span className="w-2 h-2 bg-warm-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-warm-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-warm-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-warm-100 bg-white px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Hera..."
              className="flex-1 resize-none px-4 py-3 bg-warm-50 border border-warm-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent text-[15px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-12 w-12 flex items-center justify-center bg-warm-800 hover:bg-warm-900 disabled:bg-warm-300 text-white rounded-2xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-warm-400 text-center mt-3">
            Hera learns about your wedding to give you better suggestions
          </p>
        </div>
      </div>
    </main>
  );
}
