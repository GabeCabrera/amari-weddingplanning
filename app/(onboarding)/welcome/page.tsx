"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_NAMES = ["Opal", "Fern", "Willa", "June", "Pearl", "Hazel"];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<"naming" | "chat">("naming");
  const [plannerName, setPlannerName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input on mount
  useEffect(() => {
    if (step === "naming") {
      nameInputRef.current?.focus();
    }
  }, [step]);

  // Initial greeting after naming
  useEffect(() => {
    if (step === "chat" && messages.length === 0) {
      const timer = setTimeout(() => {
        setMessages([
          {
            role: "assistant",
            content: `Hey! I'm ${plannerName}. I'm here to help you plan your wedding.\n\nTell me a little about what you're envisioning — or just say hi 👋`,
          },
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, plannerName, messages.length]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus chat input
  useEffect(() => {
    if (step === "chat" && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [step, messages.length]);

  // Show continue button after a few exchanges
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user").length;
    if (userMessages >= 2) {
      setShowContinue(true);
    }
  }, [messages]);

  const handleNameSubmit = async (name: string) => {
    const finalName = name.trim() || "Planner";
    setPlannerName(finalName);
    
    // Save the planner name
    await fetch("/api/settings/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannerName: finalName }),
    });
    
    setStep("chat");
  };

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
          plannerName,
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

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNameSubmit(nameInput);
    }
  };

  const handleContinue = async () => {
    await fetch("/api/settings/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingComplete: true }),
    });
    router.push("/");
  };

  // Naming step
  if (step === "naming") {
    return (
      <main className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <Logo size="lg" href={undefined} />
          
          <div className="mt-12 mb-8">
            <h1 className="text-2xl font-serif text-warm-800 mb-3">
              Name your planner
            </h1>
            <p className="text-warm-500 text-sm">
              Give your wedding planner a name — or pick one of ours
            </p>
          </div>

          <div className="space-y-4">
            <input
              ref={nameInputRef}
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="Type a name..."
              className="w-full px-4 py-3 bg-white border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-transparent text-center text-lg"
            />
            
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_NAMES.map((name) => (
                <button
                  key={name}
                  onClick={() => handleNameSubmit(name)}
                  className="px-4 py-2 bg-white border border-warm-200 rounded-full text-sm text-warm-600 hover:bg-warm-100 hover:border-warm-300 transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleNameSubmit(nameInput)}
              className="w-full mt-6 py-3 bg-warm-800 hover:bg-warm-900 text-white rounded-xl transition-colors"
            >
              {nameInput.trim() ? `Name them ${nameInput.trim()}` : "Skip for now"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Chat step
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
              placeholder={`Message ${plannerName}...`}
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
            {plannerName} learns about your wedding to give you better suggestions
          </p>
        </div>
      </div>
    </main>
  );
}
