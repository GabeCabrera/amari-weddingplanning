"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -z-10 opacity-30 pointer-events-none">
        <div className="w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl animate-pulse" />
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-20 pointer-events-none">
        <div className="w-[400px] h-[400px] bg-gradient-to-tr from-accent/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              The Intelligent Wedding OS
            </div>
            
            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] mb-6 text-foreground">
              The wedding planner <br />
              <span className="text-primary italic">that actually plans.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 font-light leading-relaxed">
              Scribe & Stem isn&apos;t just a checklist. It&apos;s an AI-powered operating system that manages your budget, guests, and sanity—so you can focus on the love story.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" passHref>
                <Button size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                  Start Planning Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login" passHref>
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full border-2 hover:bg-muted/50">
                  View Demo
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p>Trusted by modern couples</p>
            </div>
          </motion.div>
        </div>

        {/* Abstract UI Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-2xl border border-border bg-white/50 backdrop-blur-sm shadow-2xl p-2 rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
            <div className="rounded-xl bg-background border border-border overflow-hidden">
              {/* Mockup Header */}
              <div className="h-12 border-b border-border flex items-center px-4 gap-2 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
              </div>
              {/* Mockup Body */}
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="h-2 w-24 bg-muted rounded-full mb-2" />
                    <div className="h-8 w-48 bg-foreground/10 rounded-lg" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/20" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="h-2 w-16 bg-primary/20 rounded-full mb-3" />
                    <div className="h-6 w-24 bg-primary/20 rounded-lg" />
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                    <div className="h-2 w-16 bg-secondary/20 rounded-full mb-3" />
                    <div className="h-6 w-24 bg-secondary/20 rounded-lg" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-white/50">
                      <div className="w-4 h-4 rounded-full border-2 border-muted" />
                      <div className="h-2 w-full bg-muted/50 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-10 -left-10 bg-white p-4 rounded-xl shadow-xl border border-border w-64"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
              <div>
                <div className="text-sm font-medium">Venue Booked</div>
                <div className="text-xs text-muted-foreground">Just now</div>
              </div>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-green-500" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
