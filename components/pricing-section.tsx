"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles, Crown } from "lucide-react";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  
  const monthlyPrice = 12;
  const yearlyPrice = 99;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  return (
    <section className="py-24 px-8 bg-warm-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-12 h-px bg-warm-400 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-light tracking-wide mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-warm-600">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-2 p-1 bg-white rounded-full shadow-sm border border-warm-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-warm-100 text-warm-800"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-warm-100 text-warm-800"
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

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="border border-warm-200 rounded-xl p-8 bg-white">
            <h3 className="text-xl font-serif tracking-wider uppercase mb-2">
              Free
            </h3>
            <p className="text-3xl font-light text-warm-700 mb-1">$0</p>
            <p className="text-sm text-warm-500 mb-6">forever</p>
            
            <p className="text-warm-600 text-sm mb-6">
              Get started with essential tools and try Hera.
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                "3 essential templates",
                "10 Hera AI messages",
                "Day-of schedule",
                "Budget tracker", 
                "Guest list",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  <span className="text-warm-600">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3 border border-warm-400 text-warm-600 
                         tracking-wider uppercase text-xs hover:bg-warm-50 transition-colors rounded-lg"
            >
              Get Started Free
            </Link>
          </div>

          {/* Aisle Plan */}
          <div className="border border-rose-200 rounded-xl p-8 bg-gradient-to-br from-rose-50/50 to-amber-50/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] tracking-widest uppercase rounded-full">
                Recommended
              </span>
            </div>
            
            <h3 className="text-xl font-serif tracking-wider uppercase mb-2 mt-2 flex items-center gap-2">
              Aisle
              <Crown className="w-5 h-5 text-amber-500" />
            </h3>
            <div className="mb-1">
              <span className="text-3xl font-light text-warm-700">
                ${billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
              </span>
            </div>
            <p className="text-sm text-warm-500 mb-6">
              {billingCycle === "monthly" ? "per month" : "per year"}
            </p>
            
            <p className="text-warm-600 text-sm mb-6">
              Everything in Free, plus:
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                "Unlimited Hera AI",
                "All 10+ templates",
                "Vibe discovery & matching",
                "Vendor contact tracking",
                "Seating chart builder",
                "Wedding party management",
                "Export to PDF",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="text-warm-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white 
                         tracking-wider uppercase text-xs hover:from-rose-600 hover:to-amber-600 transition-colors rounded-lg"
            >
              Start Planning
            </Link>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-center text-sm text-warm-400 mt-8">
          Cancel anytime · Secure checkout via Stripe
        </p>
      </div>
    </section>
  );
}
