"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!token) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" href="/" />
        </div>
        <div className="w-12 h-px bg-warm-300 mx-auto mb-6" />
        <p className="text-sm text-warm-500 mb-8">
          Invalid reset link. Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="text-xs tracking-wider uppercase text-warm-600 hover:text-warm-700 transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setIsSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" href="/" />
        </div>
        <div className="w-12 h-px bg-warm-300 mx-auto mb-6" />
        <h1 className="text-xl font-serif font-light tracking-wide mb-4">
          Password Reset
        </h1>
        <p className="text-sm text-warm-500 mb-8">
          Your password has been successfully reset.
        </p>
        <div className="w-12 h-px bg-warm-300 mx-auto mb-8" />
        <Link href="/login">
          <Button className="bg-warm-600 hover:bg-warm-700 text-white">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo size="lg" href="/" />
        </div>
        <p className="text-xs tracking-[0.25em] uppercase text-warm-500">
          Set New Password
        </p>
        <div className="w-12 h-px bg-warm-300 mx-auto mt-4" />
      </div>

      <p className="text-sm text-warm-500 text-center mb-6">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isLoading}
          />
          <p className="text-xs text-warm-500">At least 8 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-warm-600 hover:bg-warm-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
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
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div className="text-center text-warm-500">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
