"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is Scribe & Stem free to use?",
    answer: "Yes, we offer a generous Free tier that includes essential planning tools like the Budget Calculator, Guest List, and Vendor Checklist. Premium features like unlimited AI Chat and advanced contract analysis are available on paid plans.",
  },
  {
    question: "How does the AI integration work?",
    answer: "Scribe, our AI assistant, is deeply integrated into every tool. You can ask it to 'Draft an email to this photographer' or 'Analyze this venue contract for hidden fees', and it interacts directly with your planner data.",
  },
  {
    question: "Can I invite my partner?",
    answer: "Absolutely. Collaboration is built-in. You can invite your partner to your board so you can both manage tasks, budget, and guest lists in real-time.",
  },
  {
    question: "Does it sync with Google Calendar?",
    answer: "Yes! Connect your Google Calendar to see all your wedding deadlines alongside your personal schedule. We make sure you never miss a payment or a tasting.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-4xl mb-12 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i} 
              className="border border-border rounded-2xl overflow-hidden bg-white transition-colors hover:border-primary/20"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-medium text-lg">{faq.question}</span>
                <Plus 
                  className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    openIndex === i ? "rotate-45 text-primary" : "text-muted-foreground"
                  )} 
                />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
