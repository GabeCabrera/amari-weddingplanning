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
    <section className="py-24 px-6 bg-warm-50/50" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-light mb-4 text-warm-900">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-warm-500">
            Start free, upgrade when you need more
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 bg-white rounded-full shadow-sm border border-warm-200">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-warm-800 text-white"
                  : "text-warm-600 hover:text-warm-800"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === "yearly"
                  ? "bg-warm-800 text-white"
                  : "text-warm-600 hover:text-warm-800"
              }`}
            >
              Yearly
              {billingCycle !== "yearly" && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Save ${yearlySavings}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl p-8 border border-warm-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-warm-800 mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-warm-800">$0</span>
              </div>
              <p className="text-sm text-warm-400 mt-1">Free forever</p>
            </div>
            
            <p className="text-warm-600 mb-8">
              Everything you need to start planning your wedding.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                "Budget tracker",
                "Guest list management",
                "Day-of schedule",
                "10 Hera assistant messages",
                "Access from any device",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-warm-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3.5 border border-warm-300 text-warm-700 
                         font-medium hover:bg-warm-50 transition-colors rounded-full"
            >
              Get started
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-gradient-to-br from-warm-800 to-warm-900 rounded-2xl p-8 text-white relative overflow-hidden">
            {/* Popular badge */}
            <div className="absolute top-6 right-6">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-medium rounded-full">
                Most popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Aisle Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-semibold">
                  ${billingCycle === "monthly" ? monthlyPrice : yearlyPrice}
                </span>
                <span className="text-warm-300">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
              </div>
              {billingCycle === "yearly" && (
                <p className="text-sm text-warm-300 mt-1">
                  That&apos;s just ${Math.round(yearlyPrice / 12)}/month
                </p>
              )}
            </div>
            
            <p className="text-warm-200 mb-8">
              The complete toolkit for stress-free wedding planning.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                "Everything in Free",
                "All 10+ planning templates",
                "Unlimited Hera assistant",
                "Seating chart builder",
                "Vendor tracking & contracts",
                "Export to PDF",
                "Priority support",
              ].map((feature, i) => (
                <div key={feature} className="flex items-center gap-3">
                  {feature.includes("Hera") ? (
                    <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                  )}
                  <span className="text-warm-100">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="block text-center py-3.5 bg-white text-warm-800 
                         font-medium hover:bg-warm-100 transition-colors rounded-full"
            >
              Start free trial
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-warm-400 mt-10">
          All plans include a 14-day free trial of Pro features · Cancel anytime
        </p>
      </div>
    </section>
  );
}
