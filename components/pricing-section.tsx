"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function PricingSection() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  
  const prices = {
    aisle: { monthly: 12, yearly: 99 },
    planner: { monthly: 120, yearly: 999 },
  };

  return (
    <section className="py-24 px-6 bg-white" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-light mb-4 text-warm-900">
            Pricing
          </h2>
          <p className="text-lg text-warm-500">
            Free to start. Upgrade when you're ready.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center p-1 bg-warm-100 rounded-full">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                billing === "monthly"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm transition-all ${
                billing === "yearly"
                  ? "bg-white text-warm-800 shadow-sm"
                  : "text-warm-500"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="rounded-2xl border border-warm-200 p-8 bg-white">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-warm-800 mb-1">Free</h3>
              <p className="text-sm text-warm-500">For getting started</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-light text-warm-800">$0</span>
            </div>

            <Link
              href="/register"
              className="block w-full py-3 text-center text-sm font-medium text-warm-700 border border-warm-300 rounded-full hover:bg-warm-50 transition-colors mb-8"
            >
              Get started
            </Link>

            <div className="space-y-3">
              {[
                "3 planning templates",
                "Budget tracker",
                "Guest list",
                "Day-of schedule",
                "10 messages with Hera",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-warm-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-warm-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aisle */}
          <div className="rounded-2xl border border-warm-300 p-8 bg-warm-50/50 relative">
            <div className="absolute -top-3 left-6">
              <span className="px-3 py-1 bg-warm-800 text-white text-xs rounded-full">
                Popular
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-warm-800 mb-1">Aisle</h3>
              <p className="text-sm text-warm-500">For couples planning their wedding</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-light text-warm-800">
                ${billing === "monthly" ? prices.aisle.monthly : prices.aisle.yearly}
              </span>
              <span className="text-warm-500 ml-1">
                /{billing === "monthly" ? "mo" : "yr"}
              </span>
              {billing === "yearly" && (
                <p className="text-sm text-warm-400 mt-1">
                  ${Math.round(prices.aisle.yearly / 12)}/mo billed yearly
                </p>
              )}
            </div>

            <Link
              href="/register"
              className="block w-full py-3 text-center text-sm font-medium text-white bg-warm-800 rounded-full hover:bg-warm-900 transition-colors mb-8"
            >
              Start free trial
            </Link>

            <div className="space-y-3">
              <p className="text-sm text-warm-500 mb-2">Everything in Free, plus:</p>
              {[
                "All 10+ planning templates",
                "Unlimited Hera",
                "Seating chart builder",
                "Vendor tracking",
                "Wedding party management",
                "Export to PDF",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-warm-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-warm-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Planner */}
          <div className="rounded-2xl border border-warm-200 p-8 bg-white">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-warm-800 mb-1">Planner</h3>
              <p className="text-sm text-warm-500">For wedding professionals</p>
            </div>
            
            <div className="mb-6">
              <span className="text-4xl font-light text-warm-800">
                ${billing === "monthly" ? prices.planner.monthly : prices.planner.yearly}
              </span>
              <span className="text-warm-500 ml-1">
                /{billing === "monthly" ? "mo" : "yr"}
              </span>
              {billing === "yearly" && (
                <p className="text-sm text-warm-400 mt-1">
                  ${Math.round(prices.planner.yearly / 12)}/mo billed yearly
                </p>
              )}
            </div>

            <Link
              href="mailto:hello@aisleboard.com?subject=Aisle for Planners"
              className="block w-full py-3 text-center text-sm font-medium text-warm-700 border border-warm-300 rounded-full hover:bg-warm-50 transition-colors mb-8"
            >
              Contact us
            </Link>

            <div className="space-y-3">
              <p className="text-sm text-warm-500 mb-2">Everything in Aisle, plus:</p>
              {[
                "Manage multiple couples",
                "Client portal for each wedding",
                "Custom intake questionnaires",
                "Hera learns your style",
                "Vendor relationship tools",
                "Analytics across weddings",
                "Priority support",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-warm-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-warm-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-warm-400 mt-10">
          All paid plans include a 14-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
