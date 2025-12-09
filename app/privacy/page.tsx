import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Scribe & Stem",
  description: "Our commitment to protecting your personal information. Read the Scribe & Stem Privacy Policy to understand how we collect, use, and safeguard your data.",
  alternates: {
    canonical: "https://scribeandstem.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Scribe & Stem",
    description: "Our commitment to protecting your personal information.",
    url: "https://scribeandstem.com/privacy",
    type: "website",
  },
};

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Privacy Policy",
    description: "Scribe & Stem Privacy Policy",
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
            Privacy Policy
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
              <h2 className="text-3xl text-foreground mb-6">Introduction</h2>
              <p className="leading-relaxed">
                At Scribe & Stem (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our wedding planning platform at scribeandstem.com.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Information We Collect</h2>
              <p className="mb-4">
                We collect information you provide directly to us to create your personalized planning experience, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li><strong>Account Information:</strong> Name, email address, password.</li>
                <li><strong>Wedding Details:</strong> Partner's name, wedding date, venue information, budget.</li>
                <li><strong>Planning Data:</strong> Guest lists, RSVP responses, vendor contracts, notes, and preferences.</li>
                <li><strong>Communications:</strong> Messages you send to our AI assistant.</li>
              </ul>
              <p className="mb-4">
                We automatically collect certain technical information when you use our service:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Log data (IP address, browser type, pages visited)</li>
                <li>Device information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">How We Use Your Information</h2>
              <p className="mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide, maintain, and improve our services.</li>
                <li>Personalize your AI planning experience.</li>
                <li>Process transactions and manage your subscription.</li>
                <li>Send you technical notices, updates, security alerts, and support messages.</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Google Calendar Integration</h2>
              <p className="mb-4">
                If you choose to connect your Google Calendar, we request access to create and manage a dedicated wedding calendar. We only access calendar data necessary to sync your wedding events. We do not access your other calendars or personal events unless explicitly shared with your wedding calendar.
              </p>
              <p>
                Scribe & Stem&apos;s use and transfer to any other app of information received from Google APIs will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">Google API Services User Data Policy</a>, including the Limited Use requirements.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Information Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With your explicit consent.</li>
                <li>With trusted service providers who assist in our operations (e.g., payment processing via Stripe, email delivery).</li>
                <li>To comply with legal obligations or protect our rights.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Data Security</h2>
              <p>
                We implement robust technical and organizational security measures to protect your personal information. Your data is encrypted in transit and at rest. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Your Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Accessing, correcting, or deleting your data.</li>
                <li>Opting out of marketing communications.</li>
                <li>Disconnecting third-party integrations.</li>
                <li>Requesting a copy of your data (Data Portability).</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl text-foreground mb-6">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
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