"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, RotateCcw, X, Minimize2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface AIAccess {
  hasAccess: boolean;
  hasFullAccess: boolean;
  messagesUsed: number;
  messagesRemaining: number | "unlimited";
  limit: number;
}

interface ConciergeChatProps {
  isOpen: boolean;
  onClose: () => void;
  coupleNames?: string;
}

export function ConciergeChat({ isOpen, onClose, coupleNames }: ConciergeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [aiAccess, setAiAccess] = useState<AIAccess | null>(null);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history on mount
  useEffect(() => {
    if (isOpen && !hasLoaded) {
      loadConversation();
    }
  }, [isOpen, hasLoaded]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && !showUpgradePrompt) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, showUpgradePrompt]);

  const loadConversation = async () => {
    try {
      const res = await fetch("/api/concierge");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setAiAccess(data.aiAccess || null);
        setHasLoaded(true);
        
        // Check if they've hit the limit
        if (data.aiAccess && !data.aiAccess.hasAccess) {
          setShowUpgradePrompt(true);
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      // Check if limit was reached
      if (res.status === 403 && data.limitReached) {
        setShowUpgradePrompt(true);
        // Remove the optimistic message
        setMessages((prev) => prev.slice(0, -1));
        return;
      }

      if (!res.ok) throw new Error("Failed to send message");

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update AI access info
      if (data.aiAccess) {
        setAiAccess((prev) => prev ? { ...prev, ...data.aiAccess } : null);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove the optimistic message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    if (!confirm("Start a new conversation? Your current chat will be saved.")) return;
    
    try {
      await fetch("/api/concierge", { method: "DELETE" });
      setMessages([]);
    } catch (error) {
      console.error("Failed to clear conversation:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  // Minimized state
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-5 py-3 bg-warm-800 text-white rounded-full shadow-lg hover:bg-warm-700 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Continue chatting</span>
          {messages.length > 0 && (
            <span className="w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:p-6 pointer-events-none">
      {/* Backdrop for mobile */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-auto sm:hidden"
        onClick={() => setIsMinimized(true)}
      />
      
      {/* Chat Window */}
      <div className="relative w-full max-w-md h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-warm-200 flex flex-col pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100 bg-gradient-to-r from-warm-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-warm-800">Hera</h2>
              <p className="text-xs text-warm-500">Your wedding concierge</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Message counter for free users */}
            {aiAccess && !aiAccess.hasFullAccess && aiAccess.messagesRemaining !== "unlimited" && (
              <span className="text-xs text-warm-400 mr-2">
                {aiAccess.messagesRemaining} left
              </span>
            )}
            <button
              onClick={clearConversation}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              title="New conversation"
            >
              <RotateCcw className="w-4 h-4 text-warm-400" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4 text-warm-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-warm-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-warm-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showUpgradePrompt ? (
            // Upgrade prompt when limit is reached
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-rose-100 flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-serif text-warm-800 mb-2">
                You've used your free messages
              </h3>
              <p className="text-warm-500 text-sm leading-relaxed mb-6">
                Upgrade to Aisle to get unlimited access to Hera, 
                plus all premium planning templates.
              </p>
              <Link href="/choose-plan" onClick={onClose}>
                <Button className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white px-8">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Aisle
                </Button>
              </Link>
              <p className="text-xs text-warm-400 mt-4">
                Starting at $12/month
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-rose-400" />
              </div>
              <h3 className="text-lg font-serif text-warm-800 mb-2">
                Hey{coupleNames ? `, ${coupleNames.split("&")[0]?.trim()}` : ""}! 👋
              </h3>
              <p className="text-warm-500 text-sm leading-relaxed">
                I'm your wedding concierge. I can help you discover your wedding vibe, 
                answer planning questions, and find vendors that match your style.
              </p>
              {aiAccess && !aiAccess.hasFullAccess && (
                <p className="text-xs text-warm-400 mt-2">
                  {aiAccess.messagesRemaining} free messages remaining
                </p>
              )}
              <div className="mt-6 space-y-2 w-full">
                <button
                  onClick={() => setInput("Help me figure out my wedding vibe")}
                  className="w-full text-left px-4 py-3 bg-warm-50 hover:bg-warm-100 rounded-lg text-sm text-warm-700 transition-colors"
                >
                  ✨ Help me figure out my wedding vibe
                </button>
                <button
                  onClick={() => setInput("What should I be doing right now in my planning?")}
                  className="w-full text-left px-4 py-3 bg-warm-50 hover:bg-warm-100 rounded-lg text-sm text-warm-700 transition-colors"
                >
                  📋 What should I be doing right now?
                </button>
                <button
                  onClick={() => setInput("I'm feeling overwhelmed with planning")}
                  className="w-full text-left px-4 py-3 bg-warm-50 hover:bg-warm-100 rounded-lg text-sm text-warm-700 transition-colors"
                >
                  💭 I'm feeling overwhelmed
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl ${
                      msg.role === "user"
                        ? "bg-warm-700 text-white rounded-br-md"
                        : "bg-warm-100 text-warm-800 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-warm-100 px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-warm-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        {!showUpgradePrompt && (
          <div className="p-4 border-t border-warm-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your wedding..."
                className="flex-1 resize-none px-4 py-3 bg-warm-50 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm max-h-32"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-11 w-11 p-0 bg-warm-700 hover:bg-warm-800 rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Floating trigger button
export function ConciergeTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-warm-700 to-warm-800 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
      </div>
      <span className="font-medium">Ask Hera</span>
    </button>
  );
}
