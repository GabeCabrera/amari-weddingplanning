"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Artifact } from "@/components/artifacts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: {
    type: string;
    data: unknown;
  };
}

const thinkingMessages = [
  "Thinking...",
  "Planning...",
  "Considering...",
  "Almost there...",
];

// Wobbly ring path variations for animation
const leftRingPaths = [
  "M 4 22 C 4 14, 8 12, 14 12 C 21 12, 24 15, 24 22 C 24 29, 20 32, 14 32 C 7 32, 4 28, 4 22",
  "M 4.5 22 C 4 13, 9 11.5, 14 12 C 20 12.5, 24.5 16, 24 22 C 23.5 29, 19 32.5, 14 32 C 8 31.5, 4.5 27, 4.5 22",
  "M 4 21.5 C 4.5 14, 8.5 12.5, 14 12.5 C 20.5 12, 24 15.5, 24 22.5 C 24 28.5, 20 31.5, 14 31.5 C 7.5 32, 3.5 28, 4 21.5",
  "M 4.2 22.2 C 3.8 14.5, 8 12, 14.2 12.2 C 20.5 11.8, 24.2 15.8, 23.8 22 C 24 29.2, 19.5 32, 13.8 31.8 C 7.8 32.2, 4 28.5, 4.2 22.2",
];

const rightRingPaths = [
  "M 16 22 C 16 14, 20 12, 26 12 C 33 12, 36 15, 36 22 C 36 29, 32 32, 26 32 C 19 32, 16 28, 16 22",
  "M 16.5 22 C 16 13, 21 11.5, 26 12 C 32 12.5, 36.5 16, 36 22 C 35.5 29, 31 32.5, 26 32 C 20 31.5, 16.5 27, 16.5 22",
  "M 16 21.5 C 16.5 14, 20.5 12.5, 26 12.5 C 32.5 12, 36 15.5, 36 22.5 C 36 28.5, 32 31.5, 26 31.5 C 19.5 32, 15.5 28, 16 21.5",
  "M 16.2 22.2 C 15.8 14.5, 20 12, 26.2 12.2 C 32.5 11.8, 36.2 15.8, 35.8 22 C 36 29.2, 31.5 32, 25.8 31.8 C 19.8 32.2, 16 28.5, 16.2 22.2",
];

// Breathing, wobbly thinking logo - like Claude's orb
function BreathingLogo({ size = 48 }: { size?: number }) {
  const [frame, setFrame] = useState(0);
  const [breathePhase, setBreathePhase] = useState(0);

  // Wobbly animation - fast
  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 4), 120);
    return () => clearInterval(interval);
  }, []);

  // Breathing animation - slow, smooth
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathePhase(p => (p + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Calculate breathing scale (1.0 to 1.15, smooth sine wave)
  const breatheScale = 1 + 0.15 * Math.sin((breathePhase / 100) * Math.PI * 2);
  
  // Subtle rotation wobble
  const wobbleRotate = Math.sin((breathePhase / 100) * Math.PI * 4) * 2;

  return (
    <div 
      className="transition-transform"
      style={{ 
        width: size, 
        height: size,
        transform: `scale(${breatheScale}) rotate(${wobbleRotate}deg)`,
      }}
    >
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d={leftRingPaths[frame]}
          stroke="#D4A69C"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={rightRingPaths[frame]}
          stroke="#D4A69C"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// Message avatar
function Avatar({ isUser }: { isUser: boolean }) {
  if (isUser) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
        <path
          d="M 4 22 C 4 14, 8 12, 14 12 C 21 12, 24 15, 24 22 C 24 29, 20 32, 14 32 C 7 32, 4 28, 4 22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 16 22 C 16 14, 20 12, 26 12 C 33 12, 36 15, 36 22 C 36 29, 32 32, 26 32 C 19 32, 16 28, 16 22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default function ChatPage() {
  const { status } = useSession();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Cycle thinking messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setThinkingMessage(prev => (prev + 1) % thinkingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  // Load existing conversation on mount
  useEffect(() => {
    if (status === "authenticated" && !hasLoaded) {
      loadConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const loadConversation = async () => {
    setHasLoaded(true);
    setIsLoading(true);
    try {
      const loadResponse = await fetch("/api/chat/load");
      const loadData = await loadResponse.json();
      
      if (loadData.conversationId && loadData.messages?.length > 0) {
        setConversationId(loadData.conversationId);
        setMessages(loadData.messages.map((m: { role: string; content: string; artifact?: { type: string; data: unknown } }, i: number) => ({
          id: `loaded-${i}`,
          role: m.role as "user" | "assistant",
          content: m.content,
          artifact: m.artifact,
        })));
      } else {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: null, conversationId: null }),
        });
        const data = await response.json();
        if (response.ok && data.message) {
          setConversationId(data.conversationId);
          setMessages([{
            id: Date.now().toString(),
            role: "assistant",
            content: data.message,
            artifact: data.artifact,
          }]);
        }
      }
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || "Request failed");
      }

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        artifact: data.artifact,
      }]);
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

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  if (status === "loading") {
    return (
      <div className="h-full flex items-center justify-center">
        <BreathingLogo size={64} />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-canvas">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Empty state */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center mb-4">
                <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                  <path d="M 4 22 C 4 14, 8 12, 14 12 C 21 12, 24 15, 24 22 C 24 29, 20 32, 14 32 C 7 32, 4 28, 4 22" stroke="#D4A69C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 16 22 C 16 14, 20 12, 26 12 C 33 12, 36 15, 36 22 C 36 29, 32 32, 26 32 C 19 32, 16 28, 16 22" stroke="#D4A69C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-ink mb-2">Let&apos;s plan your wedding</h2>
              <p className="text-ink-soft text-center max-w-md">
                I&apos;m here to help with everything from venues to vendors, 
                budgets to guest lists. What&apos;s on your mind?
              </p>
            </div>
          )}
          
          {/* Messages */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <Avatar isUser={msg.role === "user"} />
                <div className={`flex-1 ${msg.role === "user" ? "flex justify-end" : ""}`}>
                  <div 
                    className={`
                      inline-block max-w-[85%] px-4 py-3 rounded-2xl
                      ${msg.role === "user" 
                        ? "bg-sage-100 text-ink rounded-br-md" 
                        : "bg-white border border-stone-200 text-ink"
                      }
                    `}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.artifact && (
                    <div className="mt-3">
                      <Artifact type={msg.artifact.type} data={msg.artifact.data} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Thinking indicator - breathing logo */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <BreathingLogo size={56} />
              <p className="text-sm text-ink-soft mt-3 animate-pulse">
                {thinkingMessages[thinkingMessage]}
              </p>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div className="flex gap-3 mt-6">
              <Avatar isUser={false} />
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-sm text-red-700">Something went wrong: {error}</p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t border-stone-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full border border-stone-300 rounded-xl px-4 py-3 pr-12
                  resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent
                  bg-canvas text-ink placeholder:text-ink-faint
                  min-h-[48px] max-h-[200px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bottom-2 p-2 rounded-lg
                  bg-rose-500 text-white
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:bg-rose-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-ink-faint mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
