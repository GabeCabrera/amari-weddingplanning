"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  
  const monthlyPrice = 12;
  const yearlyPrice = 99;
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice;

  return (
    <section className="py-24 px-8 bg-warm-50/50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-light tracking-wide mb-4 text-warm-800">
            Simple pricing
          </h2>
          <p className="text-warm-500">
            Start free, upgrade when you&apos;re ready
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 p-1 bg-white rounded-full shadow-sm border border-warm-100">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                billingCycle === "monthly"
                  ? "bg-warm-100 text-warm-800 font-medium"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-warm-100 text-warm-800 font-medium"
                  : "text-warm-500 hover:text-warm-700"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs rounded-full">
                Save ${yearlySavings}
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="border border-warm-200 rounded-2xl p-8 bg-white">
            <h3 className="text-xl font-serif mb-2 text-warm-800">
              Free
            </h3>
            <p className="text-3xl font-light text-warm-700 mb-1">$0</p>
            <p className="text-sm text-warm-400 mb-6">forever</p>
            
            <p className="text-warm-600 text-sm mb-6">
              Everything you need to get started
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                "Budget tracker",
                "Guest list",
                "Day-of schedule",
                "10 messages with Hera",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-warm-400 flex-shrink-0" />
                  <span className="text-warm-600">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3 border border-warm-300 text-warm-600 
                         text-sm hover:bg-warm-50 transition-colors rounded-full"
            >
              Get started
            </Link>
          </div>

          {/* Aisle Plan */}
          <div className="border border-rose-200 rounded-2xl p-8 bg-gradient-to-br from-white to-rose-50/30 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 bg-warm-700 text-white text-xs tracking-wider uppercase rounded-full">
                Popular
              </span>
            </div>
            
            <h3 className="text-xl font-serif mb-2 mt-2 text-warm-800">
              Aisle
            </h3>
            <div className="mb-1">
              <span className="text-3xl font-light text-warm-700">
                ${billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
              </span>
            </div>
            <p className="text-sm text-warm-400 mb-6">
              {billingCycle === "monthly" ? "per month" : "per year"}
            </p>
            
            <p className="text-warm-600 text-sm mb-6">
              The full experience
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                "Everything in Free",
                "All 10+ templates",
                "Unlimited Hera",
                "Seating chart builder",
                "Vendor tracking",
                "Export to PDF",
              ].map((feature, i) => (
                <div key={feature} className="flex items-center gap-3 text-sm">
                  {i === 2 ? (
                    <Sparkles className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  <span className="text-warm-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3 bg-warm-700 text-white 
                         text-sm hover:bg-warm-800 transition-colors rounded-full"
            >
              Start planning
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-warm-400 mt-8">
          Cancel anytime · Secure payments via Stripe
        </p>
      </div>
    </section>
  );
}
