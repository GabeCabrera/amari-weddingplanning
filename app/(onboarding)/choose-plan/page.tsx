"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, Sparkles, Calendar, Users, Heart, ArrowLeft, Tag, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { toast } from "sonner";
import * as redditPixel from "@/lib/reddit-pixel";

const FREE_FEATURES = [
  "3 essential templates",
  "10 AI planner messages",
  "Day-of schedule",
  "Budget tracker",
  "Guest list",
];

const AISLE_FEATURES = [
  "All 10+ planning templates",
  "Unlimited AI planner",
  "Vibe discovery & matching",
  "Vendor contact tracking",
  "Seating chart builder",
  "Wedding party management",
  "Timeline & checklists",
  "Export to PDF anytime",
  "Priority support",
];

function ChoosePlanContent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<"free" | "aisle" | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [isLoading, setIsLoading] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{
    valid: boolean;
    type?: "free" | "percentage" | "fixed";
    value?: number;
    description?: string;
  } | null>(null);
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);

  // Pricing
  const monthlyPrice = 12;
  const yearlyPrice = 99;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice; // $45 savings

  // Show loading while session is being fetched
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-warm-300 border-t-warm-600 rounded-full animate-spin" />
      </main>
    );
  }

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    setIsCheckingPromo(true);
    try {
      const response = await fetch("/api/stripe/check-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode: promoCode.trim() }),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setPromoResult(null);
        return;
      }

      if (data.valid) {
        setPromoResult(data);
        if (data.type === "free") {
          toast.success("🎉 Free membership code applied!");
        } else {
          toast.success(`${data.description} applied!`);
        }
      } else {
        toast.error("Invalid promo code");
        setPromoResult(null);
      }
    } catch (error) {
      toast.error("Failed to check promo code");
      setPromoResult(null);
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleClearPromoCode = () => {
    setPromoCode("");
    setPromoResult(null);
  };

  const handleContinueWithFree = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/plan/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });

      await fetch("/api/settings/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
      
      redditPixel.trackLead();
      router.push("/welcome");
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // If it's a FREE promo code, apply it directly
      if (promoResult?.type === "free") {
        const response = await fetch("/api/stripe/apply-free-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ promoCode: promoCode.trim() }),
        });

        const data = await response.json();

        if (data.success) {
          await fetch("/api/settings/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ onboardingComplete: true }),
          });

          toast.success("🎉 " + data.message);
          redditPixel.trackPurchase(0);
          router.push("/welcome");
          return;
        } else {
          throw new Error("Failed to apply free membership");
        }
      }

      // Otherwise, go to Stripe subscription checkout
      const response = await fetch("/api/stripe/create-subscription-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          billingCycle,
          promoCode: promoCode.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Something went wrong");
      setIsLoading(false);
    }
  };

  // Calculate display price with promo
  const basePrice = billingCycle === "monthly" ? monthlyPrice : yearlyPrice;
  let displayPrice = basePrice;
  
  if (promoResult?.valid && promoResult.type !== "free") {
    if (promoResult.type === "percentage" && promoResult.value) {
      displayPrice = basePrice * (1 - promoResult.value / 100);
    } else if (promoResult.type === "fixed" && promoResult.value) {
      displayPrice = Math.max(0, basePrice - promoResult.value / 100);
    }
  }

  return (
    <main className="min-h-screen py-16 px-8 relative">
      {/* Back to Home */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-warm-500 hover:text-warm-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo size="lg" href="/" />
          </div>
          <div className="w-12 h-px bg-warm-400 mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-light tracking-widest uppercase mb-4">
            Choose Your Plan
          </h1>
          <p className="text-warm-600 max-w-md mx-auto">
            Start planning with your AI wedding concierge
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 p-1 bg-warm-100 rounded-full">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                Save ${yearlySavings}
              </span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Free Plan */}
          <div
            onClick={() => setSelectedPlan("free")}
            className={`
              relative p-8 border rounded-xl cursor-pointer transition-all duration-300
              ${selectedPlan === "free" 
                ? "border-warm-500 bg-warm-50/50 shadow-lg" 
                : "border-warm-200 hover:border-warm-300 hover:shadow-md"
              }
            `}
          >
            <div className="mb-6">
              <h2 className="text-xl font-serif tracking-wider uppercase mb-2">
                Free
              </h2>
              <p className="text-3xl font-light text-warm-700">$0</p>
              <p className="text-sm text-warm-500">forever</p>
            </div>

            <p className="text-warm-600 mb-6">
              Get started with essential planning tools and try your AI planner.
            </p>

            <div className="space-y-3 mb-8">
              {FREE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  <span className="text-warm-600">{feature}</span>
                </div>
              ))}
            </div>

            {selectedPlan === "free" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-warm-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Aisle Plan */}
          <div
            onClick={() => setSelectedPlan("aisle")}
            className={`
              relative p-8 border rounded-xl cursor-pointer transition-all duration-300
              ${selectedPlan === "aisle" 
                ? "border-rose-400 bg-gradient-to-br from-rose-50/50 to-amber-50/50 shadow-lg" 
                : "border-warm-200 hover:border-rose-200 hover:shadow-md"
              }
            `}
          >
            {/* Recommended badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs tracking-widest uppercase rounded-full">
                Recommended
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h2 className="text-xl font-serif tracking-wider uppercase mb-2 flex items-center gap-2">
                Aisle
                <Crown className="w-5 h-5 text-amber-500" />
              </h2>
              
              {/* Price display */}
              {promoResult?.type === "free" ? (
                <div>
                  <p className="text-3xl font-light text-green-600">Free</p>
                  <p className="text-sm text-green-600">with promo code</p>
                </div>
              ) : (
                <div>
                  {promoResult?.valid ? (
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-light text-green-600">
                        ${displayPrice.toFixed(0)}
                      </p>
                      <p className="text-lg text-warm-400 line-through">
                        ${basePrice}
                      </p>
                    </div>
                  ) : (
                    <p className="text-3xl font-light text-warm-700">
                      ${basePrice}
                    </p>
                  )}
                  <p className="text-sm text-warm-500">
                    {billingCycle === "monthly" ? "per month" : "per year"}
                  </p>
                </div>
              )}
            </div>

            <p className="text-warm-600 mb-6">
              The full Aisle experience with unlimited AI planning help and all premium features.
            </p>

            <div className="space-y-3 mb-8">
              {AISLE_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-warm-700">{feature}</span>
                </div>
              ))}
            </div>

            {selectedPlan === "aisle" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="max-w-md mx-auto mb-8">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <Input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Have a promo code?"
                className="pl-10 uppercase"
                disabled={isCheckingPromo || !!promoResult}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !promoResult) {
                    handleApplyPromoCode();
                  }
                }}
              />
            </div>
            {promoResult ? (
              <Button
                variant="outline"
                onClick={handleClearPromoCode}
                className="text-warm-500"
              >
                Clear
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleApplyPromoCode}
                disabled={isCheckingPromo || !promoCode.trim()}
              >
                {isCheckingPromo ? "Checking..." : "Apply"}
              </Button>
            )}
          </div>
          {promoResult?.valid && (
            <p className="text-sm text-green-600 mt-2 text-center">
              ✓ {promoResult.type === "free" ? "Free membership code applied!" : `${promoResult.description} applied!`}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {selectedPlan && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            {selectedPlan === "free" ? (
              <Button
                onClick={handleContinueWithFree}
                variant="outline"
                size="lg"
                disabled={isLoading}
                className="px-12"
              >
                {isLoading ? "Loading..." : "Start with Free"}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                size="lg"
                disabled={isLoading}
                className="px-12 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white"
              >
                {isLoading 
                  ? "Loading..." 
                  : promoResult?.type === "free"
                    ? "Claim Free Access"
                    : `Subscribe — $${displayPrice.toFixed(0)}/${billingCycle === "monthly" ? "mo" : "yr"}`
                }
              </Button>
            )}

            <p className="mt-4 text-sm text-warm-500">
              {selectedPlan === "free" 
                ? "Upgrade anytime to unlock everything" 
                : promoResult?.type === "free"
                  ? "No payment required"
                  : "Cancel anytime. Secure checkout powered by Stripe."
              }
            </p>
          </div>
        )}

        {/* Trust indicators */}
        <div className="mt-16 pt-8 border-t border-warm-200">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-warm-500">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Made for couples, by couples</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Plan at your own pace</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Powered by AI</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ChoosePlanPage() {
  return <ChoosePlanContent />;
}
