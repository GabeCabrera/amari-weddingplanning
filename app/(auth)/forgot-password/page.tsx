"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setIsSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-warm-50">
        <div className="absolute top-6 left-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-warm-500 hover:text-warm-700 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-warm-200 text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" href="/" />
          </div>
          <div className="w-12 h-px bg-warm-300 mx-auto mb-6" />
          <h1 className="text-xl font-serif font-light tracking-wide mb-4">
            Check Your Email
          </h1>
          <p className="text-sm text-warm-500 mb-8">
            If an account exists for {email}, you&apos;ll receive a password reset link shortly.
          </p>
          <div className="w-12 h-px bg-warm-300 mx-auto mb-8" />
          <Link
            href="/login"
            className="text-xs tracking-wider uppercase text-warm-600 hover:text-warm-700 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-warm-50">
      <div className="absolute top-6 left-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-warm-500 hover:text-warm-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-warm-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" href="/" />
          </div>
          <p className="text-xs tracking-[0.25em] uppercase text-warm-500">
            Reset Password
          </p>
          <div className="w-12 h-px bg-warm-300 mx-auto mt-4" />
        </div>

        <p className="text-sm text-warm-500 text-center mb-6">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-xs tracking-wider uppercase text-warm-500 hover:text-warm-600 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
