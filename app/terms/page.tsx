import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Scribe & Stem",
  description: "Terms and conditions for using the Scribe & Stem wedding planning platform. Understand your rights and responsibilities.",
  alternates: {
    canonical: "https://scribeandstem.com/terms",
  },
  openGraph: {
    title: "Terms of Service | Scribe & Stem",
    description: "Terms and conditions for using the Scribe & Stem wedding planning platform.",
    url: "https://scribeandstem.com/terms",
    type: "website",
  },
};

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Terms of Service",
    description: "Scribe & Stem Terms of Service",
    publisher: {
      "@type": "Organization",
      name: "Scribe & Stem",
      url: "https://scribeandstem.com",
    },
    dateModified: "2025-12-08",
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-12 pb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">Back to Home</span>
        </Link>
        <div className="max-w-4xl">
          <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            Last updated: December 8, 2025
          </p>
        </div>
      </header>

      {/* Content Container */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-card rounded-3xl shadow-soft border border-border p-8 md:p-12 lg:p-16">
          <article className="prose prose-lg prose-stone max-w-none headings:font-serif headings:font-medium headings:tracking-tight text-foreground/80">
            
            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using Scribe & Stem (&quot;the Service&quot;), operated by Scribe & Stem (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) at scribeandstem.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Description of Service</h2>
              <p className="mb-4">
                Scribe & Stem is an intelligent wedding planning platform that provides tools for couples to organize their wedding, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Budget tracking and management</li>
                <li>Guest list management and RSVP tracking</li>
                <li>Vendor organization and contract management</li>
                <li>Timeline and task planning</li>
                <li>Calendar integration</li>
                <li>Seating chart creation</li>
                <li>AI-powered planning assistance</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Account Registration</h2>
              <p className="mb-4">
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information.</li>
                <li>Maintain and update your information as needed.</li>
                <li>Keep your password secure and confidential.</li>
                <li>Accept responsibility for all activities under your account.</li>
                <li>Notify us immediately of any unauthorized access.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Pricing and Payments</h2>
              <p className="mb-4">
                Scribe & Stem offers both free and paid plans. For paid plans:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Paid plans are available on monthly or annual subscriptions.</li>
                <li>You can cancel your subscription at any time.</li>
                <li>All payments are processed securely through Stripe.</li>
                <li>Prices are subject to change with notice.</li>
                <li>Refunds may be provided at our discretion within 30 days of purchase.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Acceptable Use</h2>
              <p className="mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any applicable laws or regulations.</li>
                <li>Infringe on the rights of others.</li>
                <li>Upload malicious code or interfere with the Service.</li>
                <li>Attempt to gain unauthorized access to our systems.</li>
                <li>Use the Service for any fraudulent or deceptive purpose.</li>
                <li>Harass, abuse, or harm others.</li>
                <li>Send spam or unsolicited communications through the Service.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Your Content</h2>
              <p className="mb-4">
                You retain ownership of all content you submit to the Service (&quot;Your Content&quot;). By submitting content, you grant us a limited license to use, store, and display Your Content solely to provide the Service to you.
              </p>
              <p>
                You are solely responsible for Your Content and represent that you have all necessary rights to submit it.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Third-Party Integrations</h2>
              <p>
                Our Service may integrate with third-party services such as Google Calendar. Your use of these integrations is subject to the respective third party&apos;s terms of service and privacy policies. We are not responsible for the practices of these third parties.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Intellectual Property</h2>
              <p>
                The Service and its original content (excluding Your Content), features, and functionality are owned by Scribe & Stem and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express permission.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Disclaimer of Warranties</h2>
              <p className="uppercase tracking-wide text-sm font-medium">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Limitation of Liability</h2>
              <div className="uppercase tracking-wide text-sm font-medium space-y-4">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCRIBE & STEM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
                </p>
                <p>
                  OUR TOTAL LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Termination</h2>
              <p className="mb-4">
                You may terminate your account at any time by contacting us. We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. We may delete your data in accordance with our data retention policies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of Utah, United States, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at{" "}
                <a 
                  href="mailto:hello@scribeandstem.com" 
                  className="text-primary underline hover:text-primary/80"
                >
                  hello@scribeandstem.com
                </a>
              </p>
            </section>

          </article>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-serif tracking-widest uppercase text-foreground mb-4">
            Scribe & Stem
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Scribe & Stem. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}