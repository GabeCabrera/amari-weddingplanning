"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto bg-foreground text-background rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden">
        
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="relative z-10">
          <h2 className="font-serif text-4xl md:text-6xl mb-6 text-white">
            Ready to find your sanity?
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 font-light">
            Join thousands of modern couples planning their weddings without the stress.
            Start for free today.
          </p>
          
          <Link href="/register" passHref>
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-foreground hover:bg-white/90 hover:scale-105 transition-all duration-300 rounded-full">
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <p className="mt-6 text-sm text-white/40">
            No credit card required for free plan.
          </p>
        </div>
      </div>
    </section>
  );
}
