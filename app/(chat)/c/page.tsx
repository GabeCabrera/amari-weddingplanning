"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Send, 
  Menu, 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  User
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Main Chat Interface - Claude-style
 * π-ID: 3.14159.5.1
 */

function AisleLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="18" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-clay-500" />
      <circle cx="30" cy="24" r="12" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-rose-400" />
      <path d="M24 14.5c2.5 2.5 4 5.8 4 9.5s-1.5 7-4 9.5c-2.5-2.5-4-5.8-4-9.5s1.5-7 4-9.5z" fill="currentColor" className="text-stone-200" opacity="0.6" />
    </svg>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  artifact?: {
    type: string;
    title: string;
    data: unknown;
  };
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversations] = useState<Conversation[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const messageId = Date.now().toString();
    
    setInput("");
    setMessages(prev => [...prev, { id: messageId, role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          conversationId: null,
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: data.message,
        artifact: data.artifact,
      }]);
    } catch {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: "assistant", 
        content: "Something went wrong. Try again?" 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <AisleLogo className="w-12 h-12 animate-breathe" />
      </div>
    );
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-canvas-deep border-r border-stone-200 flex flex-col transition-all duration-200 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AisleLogo className="w-7 h-7" />
            <span className="text-ink font-medium text-sm">Aisle</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-ink-soft" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 mb-2">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs text-ink-faint uppercase tracking-wide mb-2 px-2">Recent</div>
          {conversations.length === 0 ? (
            <p className="text-xs text-ink-faint px-2">No conversations yet</p>
          ) : (
            <div className="space-y-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-ink-faint flex-shrink-0" />
                    <span className="text-sm text-ink truncate">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="p-3 border-t border-stone-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center">
              <User className="w-4 h-4 text-ink-soft" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            <Link
              href="/settings"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-ink-soft hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </Link>
            <button
              onClick={() => signOut()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-ink-soft hover:bg-stone-100 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header (when sidebar is closed) */}
        {!sidebarOpen && (
          <header className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-ink-soft" />
            </button>
            <button
              onClick={handleNewChat}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 text-ink-soft" />
            </button>
          </header>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6">
            {!hasMessages ? (
              /* Empty State */
              <div className="h-full flex flex-col items-center justify-center pb-32">
                <div className="animate-breathe">
                  <AisleLogo className="w-16 h-16 mb-8" />
                </div>
                <h1 className="text-2xl text-ink text-center mb-3 font-light tracking-wide">
                  How can I help with your wedding?
                </h1>
                <p className="text-ink-soft text-center text-sm max-w-md">
                  Ask me anything. Budget questions, vendor advice, guest list drama, or just tell me what's on your mind.
                </p>
                
                {/* Quick prompts */}
                <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-lg">
                  {[
                    "What should I do first?",
                    "Help me set a budget",
                    "Show me my guest list",
                    "I'm stressed about seating",
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-2 bg-canvas-soft border border-stone-200 rounded-xl text-sm text-ink-soft hover:border-stone-300 hover:bg-stone-100 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="py-8 space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 mr-4 flex-shrink-0 mt-1">
                        <AisleLogo className="w-8 h-8" />
                      </div>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`${
                          message.role === "user"
                            ? "bg-ink text-ink-inverse px-5 py-3.5 rounded-[20px_20px_6px_20px]"
                            : "text-ink"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      
                      {/* Artifact rendering */}
                      {message.artifact && (
                        <div className="mt-4 p-4 bg-canvas-soft border border-stone-200 rounded-2xl">
                          <div className="text-xs text-ink-faint uppercase tracking-wide mb-2">
                            {message.artifact.title}
                          </div>
                          <pre className="text-xs text-ink-soft overflow-auto">
                            {JSON.stringify(message.artifact.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-start">
                    <div className="w-8 h-8 mr-4 flex-shrink-0">
                      <AisleLogo className="w-8 h-8" />
                    </div>
                    <div className="flex gap-1.5 py-3">
                      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-stone-200 bg-canvas">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
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
                placeholder="Message Aisle..."
                className="w-full resize-none pl-5 pr-14 py-4 bg-canvas-soft border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent text-sm text-ink placeholder:text-ink-faint max-h-40 shadow-soft"
                rows={1}
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="absolute right-3 bottom-3 h-9 w-9 flex items-center justify-center bg-ink hover:bg-ink/90 disabled:bg-stone-300 text-ink-inverse rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-ink-faint text-center mt-3">
              Aisle can make mistakes. Double-check important details.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
