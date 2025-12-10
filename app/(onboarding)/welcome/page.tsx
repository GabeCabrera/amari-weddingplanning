"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { Loader2 } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    partnerName: "",
    weddingDate: "",
  });

  // Redirect if already onboarded
  useEffect(() => {
    if (session?.user?.onboardingComplete) {
      router.push("/planner");
    }
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update profile
      await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // If they entered a partner name, append it to their display name? 
          // Or just store it in the kernel? For now, let's just update the wedding date.
          // If we want to update the display name, we'd need to know the current one.
          // Let's just send what we have.
          weddingDate: formData.weddingDate || null,
          onboardingComplete: true,
        }),
      });

      // Update session
      await update({ onboardingComplete: true });

      router.push("/planner");
    } catch (error) {
      console.error("Onboarding error:", error);
      // Proceed anyway
      router.push("/planner");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <Logo size="xl" href={undefined} />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif text-4xl text-warm-900">Welcome to Stem</h1>
          <p className="text-warm-600">Let&apos;s set up your workspace.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-soft border border-warm-100 space-y-6 text-left">
          
          <div className="space-y-2">
            <Label htmlFor="weddingDate">When is the big day?</Label>
            <Input
              id="weddingDate"
              type="date"
              value={formData.weddingDate}
              onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
              className="h-12"
            />
            <p className="text-xs text-muted-foreground">
              It&apos;s okay if you don&apos;t have an exact date yet.
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Start Planning
          </Button>
        </form>
      </div>
    </main>
  );
}