"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// Thinking status messages that cycle through
const thinkingMessages = [
  "Reading your message...",
  "Thinking about your wedding...",
  "Considering the details...",
  "Crafting a response...",
  "Almost ready...",
];

// Wiggly Logo Component
function WigglyLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className="animate-wiggle"
    >
      {/* Wobbly arch/aisle shape */}
      <path
        d="M 20 80 
           Q 22 30, 50 25 
           Q 78 30, 80 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        className="text-rose-400"
      />
      {/* Little heart at the top */}
      <path
        d="M 50 20 
           C 45 15, 38 18, 40 25 
           Q 42 30, 50 35 
           Q 58 30, 60 25 
           C 62 18, 55 15, 50 20"
        fill="currentColor"
        className="text-rose-300 animate-pulse"
      />
    </svg>
  );
}

// Thinking Indicator Component
function ThinkingIndicator() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % thinkingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 border border-rose-100 max-w-[85%]">
      <div className="flex-shrink-0 mt-1">
        <WigglyLogo size={36} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-rose-600">Aisle</p>
        <p className="text-gray-600 text-sm animate-fade-in-out">
          {thinkingMessages[messageIndex]}
        </p>
        <div className="flex gap-1 mt-1">
          <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce-dot" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce-dot" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-rose-300 rounded-full animate-bounce-dot" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when not loading
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    // Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId: null }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || "Request failed");
      }

      // Add assistant message
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-amber-50">
        <WigglyLogo size={60} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-stone-50 to-rose-50/30">
      {/* Header */}
      <header className="border-b border-rose-100 bg-white/80 backdrop-blur-sm p-4 flex items-center gap-3">
        <WigglyLogo size={32} />
        <h1 className="text-xl font-semibold text-stone-800">Aisle</h1>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <WigglyLogo size={80} />
            <p className="text-stone-500 mt-4">
              Send a message to start planning your wedding ✨
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-2xl max-w-[85%] ${
              msg.role === "user"
                ? "bg-stone-800 text-white ml-auto"
                : "bg-white border border-rose-100 shadow-sm"
            }`}
          >
            <p className={`text-sm font-medium mb-1 ${
              msg.role === "user" ? "text-stone-300" : "text-rose-600"
            }`}>
              {msg.role === "user" ? "You" : "Aisle"}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {isLoading && <ThinkingIndicator />}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
            <p className="font-medium">Oops!</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-rose-100 bg-white/80 backdrop-blur-sm p-4">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell me about your wedding..."
            className="flex-1 border border-rose-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent bg-white"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-5 py-2 bg-rose-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
