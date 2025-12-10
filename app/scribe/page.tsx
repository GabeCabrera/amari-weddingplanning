import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Mail, PenTool } from "lucide-react";

export const metadata = {
  title: "The Wedding Scribe | AI Contract & Logistics Agent",
  description: "An autonomous agent that analyzes vendor contracts, drafts emails, and manages wedding logistics. Your Chief of Staff, not just a binder.",
};

export default function ScribePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 max-w-7xl mx-auto">
        <div className="max-w-4xl space-y-8">
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] tracking-tight">
            Your Wedding Requires a <span className="italic text-muted-foreground">Chief of Staff</span>. <br />
            Not a Binder.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Binders hold paper. Scribes read it. Deploy an autonomous agent to analyze vendor contracts for liability clauses, draft negotiation emails in seconds, and ghostwrite your vows before writer&apos;s block sets in.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg">
                Initialize Scribe Agent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 p-6 bg-muted/30 rounded-2xl border border-border/50 max-w-3xl">
            <blockquote className="text-lg font-medium text-muted-foreground italic border-l-4 border-primary pl-4">
              &quot;You are managing a $40,000 project with 15 contractors and 150 stakeholders. That is not a party; that is a logistics operation. Stop using a spreadsheet. Start using an Operating System.&quot;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Feature Grid (Optional but good for content density) */}
      <section className="px-6 py-20 bg-muted/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="space-y-4 p-6 bg-background rounded-2xl border border-border shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">AI Contract Review</h3>
            <p className="text-muted-foreground">
              Upload PDF contracts. Scribe identifies hidden fees, cancellation clauses, and &quot;force majeure&quot; gaps instantly.
            </p>
          </div>

          <div className="space-y-4 p-6 bg-background rounded-2xl border border-border shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">Vendor Email Generator</h3>
            <p className="text-muted-foreground">
              Negotiate rates and request changes with professionally drafted emails. Tone-adjusted for &quot;Firm but Polite.&quot;
            </p>
          </div>

          <div className="space-y-4 p-6 bg-background rounded-2xl border border-border shadow-sm">
            <div className="h-12 w-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <PenTool className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">Vow Assistant</h3>
            <p className="text-muted-foreground">
              Convert bullet points of memories into cohesive, structured vows. Writer&apos;s block elimination protocol.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
