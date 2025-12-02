import Link from "next/link";
import { 
  Heart, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Check,
  X
} from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { Logo } from "@/components/logo";

export function LandingPage() {
  return (
    <main className="min-h-screen select-none">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col px-8 pt-12 pb-8 bg-gradient-to-b from-rose-50/30 to-white overflow-hidden">
        {/* Top content */}
        <div className="text-center max-w-2xl mx-auto flex-shrink-0">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo size="lg" href={undefined} />
          </div>
          
          <div className="w-16 h-px bg-warm-300 mx-auto mb-6" />

          {/* Simple, warm headline */}
          <h1 className="text-4xl md:text-5xl font-serif font-light tracking-wide mb-6 text-warm-800">
            Plan your wedding,
            <br />
            <span className="text-warm-600">without the chaos</span>
          </h1>
          
          <p className="text-lg text-warm-600 mb-8 leading-relaxed font-light max-w-md mx-auto">
            A calm, beautiful space for you and your partner. 
            Everything you need, nothing you don&apos;t.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-700 text-white
                         tracking-widest uppercase text-sm hover:bg-warm-800 
                         transition-colors duration-300"
            >
              Start Planning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-block px-8 py-4 border border-warm-300 text-warm-600 
                         tracking-widest uppercase text-sm hover:bg-warm-50 
                         transition-colors duration-300"
            >
              Sign In
            </Link>
          </div>
          
          <p className="text-sm text-warm-400">
            Free to start · No credit card required
          </p>
        </div>

        {/* Product Preview */}
        <div className="flex-1 flex items-end justify-center max-w-5xl mx-auto w-full mt-12">
          <div className="w-full transform translate-y-12 md:translate-y-16">
            <div className="bg-white rounded-t-2xl shadow-[0_-10px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-warm-100 border-b-0">
              {/* Browser Chrome */}
              <div className="bg-warm-100/50 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-warm-200" />
                  <div className="w-3 h-3 rounded-full bg-warm-200" />
                  <div className="w-3 h-3 rounded-full bg-warm-200" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white/70 rounded-full px-3 py-1 text-xs text-warm-400 text-center max-w-xs mx-auto">
                    yourtwo.aisleboard.com
                  </div>
                </div>
              </div>
              
              {/* App Preview Content */}
              <div className="p-4 md:p-6">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Sidebar Preview */}
                  <div className="hidden md:block bg-warm-50/50 rounded-xl p-4 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-warm-400 mb-3">Your Pages</div>
                    {["Budget", "Guest List", "Timeline", "Vendors", "Seating"].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-white shadow-sm text-warm-700' : 'text-warm-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-warm-300'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                  
                  {/* Main Content Preview */}
                  <div className="md:col-span-3 bg-white rounded-xl p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-serif text-warm-800">Budget</h3>
                        <p className="text-sm text-warm-400">Track your spending</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-light text-warm-700">$16,500</div>
                        <div className="text-xs text-warm-400">remaining of $25,000</div>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="h-2 bg-warm-100 rounded-full mb-6 overflow-hidden">
                      <div className="h-full w-1/3 bg-gradient-to-r from-rose-300 to-amber-300 rounded-full" />
                    </div>
                    
                    {/* Sample Items */}
                    <div className="space-y-3">
                      {[
                        { category: "Venue", vendor: "The Garden Estate", cost: "$5,000", paid: true },
                        { category: "Photography", vendor: "Emma Collins", cost: "$2,500", paid: true },
                        { category: "Florals", vendor: "Wildbloom Studio", cost: "$1,000", paid: false },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-warm-100 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-warm-50 flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-warm-400" />
                            </div>
                            <div>
                              <div className="font-medium text-warm-700">{item.category}</div>
                              <div className="text-sm text-warm-400">{item.vendor}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-warm-600">{item.cost}</span>
                            {item.paid && (
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">Paid</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Simple quote */}
      <section className="py-16 px-8 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xl text-warm-600 font-serif italic leading-relaxed">
            &ldquo;Finally, a wedding planner that doesn&apos;t make me want to 
            throw my laptop out the window.&rdquo;
          </p>
          <p className="text-warm-400 text-sm mt-4">— A very relieved bride-to-be</p>
        </div>
      </section>

      {/* Why Aisle - Clean comparison */}
      <section className="py-20 px-8 bg-warm-50/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-light tracking-wide mb-4 text-warm-800">
              Why couples choose Aisle
            </h2>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-2xl border border-warm-200 bg-white">
            <div className="grid grid-cols-3">
              {/* Header */}
              <div className="p-4 bg-warm-50"></div>
              <div className="p-4 bg-warm-100 text-center">
                <span className="text-xs uppercase tracking-wider text-warm-500">Other Apps</span>
              </div>
              <div className="p-4 bg-warm-700 text-center">
                <span className="text-xs uppercase tracking-wider text-white">Aisle</span>
              </div>

              {/* Rows */}
              {[
                { feature: "Ads", other: "Everywhere", aisle: "None" },
                { feature: "Interface", other: "Overwhelming", aisle: "Calm" },
                { feature: "Your data", other: "Sold to vendors", aisle: "Private" },
                { feature: "Setup", other: "20+ questions", aisle: "60 seconds" },
                { feature: "Vibe", other: "Stressful", aisle: "Peaceful" },
              ].map((row, i) => (
                <div key={row.feature} className="contents">
                  <div className={`p-4 font-medium text-warm-700 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'}`}>
                    {row.feature}
                  </div>
                  <div className={`p-4 text-center ${i % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'}`}>
                    <div className="flex items-center justify-center gap-2 text-warm-400 text-sm">
                      <X className="w-4 h-4 text-warm-300" />
                      <span>{row.other}</span>
                    </div>
                  </div>
                  <div className={`p-4 text-center ${i % 2 === 0 ? 'bg-warm-50' : 'bg-warm-100/50'}`}>
                    <div className="flex items-center justify-center gap-2 text-warm-700 text-sm">
                      <Check className="w-4 h-4 text-rose-400" />
                      <span className="font-medium">{row.aisle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Visual, Pinterest-style cards */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-light tracking-wide mb-4">
              Everything in one place
            </h2>
            <p className="text-warm-500">
              No more scattered spreadsheets and forgotten notes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Budget",
                description: "See where every dollar goes",
                color: "from-rose-50 to-rose-100",
                iconColor: "text-rose-400",
              },
              {
                icon: Users,
                title: "Guest List",
                description: "RSVPs, meals, and seating",
                color: "from-amber-50 to-amber-100",
                iconColor: "text-amber-500",
              },
              {
                icon: Calendar,
                title: "Timeline",
                description: "Never miss a deadline",
                color: "from-blue-50 to-blue-100",
                iconColor: "text-blue-400",
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 text-center`}
              >
                <div className={`w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-serif text-lg text-warm-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-warm-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {[
              {
                icon: Heart,
                title: "Wedding Party",
                description: "Keep your crew organized",
                color: "from-pink-50 to-pink-100",
                iconColor: "text-pink-400",
              },
              {
                icon: Sparkles,
                title: "Hera",
                description: "Your planning bestie, available 24/7",
                color: "from-purple-50 to-purple-100",
                iconColor: "text-purple-400",
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 text-center`}
              >
                <div className={`w-14 h-14 rounded-full bg-white/80 flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="font-serif text-lg text-warm-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-warm-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional moment */}
      <section className="py-20 px-8 bg-rose-50/30">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-8 h-8 text-rose-300 mx-auto mb-6" />
          <h2 className="text-3xl font-serif font-light tracking-wide mb-6 text-warm-800">
            Congratulations
          </h2>
          <p className="text-warm-600 leading-relaxed text-lg">
            You said yes. You found your person. And now you get to plan one of the most 
            beautiful days of your life — together.
          </p>
          <p className="text-warm-600 leading-relaxed text-lg mt-4">
            Take a breath. This should be joyful.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* About - Personal touch */}
      <section className="py-20 px-8 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-serif font-light tracking-wide text-warm-800">
              A note from us
            </h2>
          </div>

          <div className="text-center text-warm-600 leading-relaxed">
            <p className="mb-4">
              Hi, we&apos;re Sarah & Gabe. We&apos;re getting married in 2026.
            </p>
            <p className="mb-4">
              We built Aisle because every other wedding app felt like it was designed 
              to stress us out and sell us things. We wanted something that felt 
              as special as the wedding itself.
            </p>
            <p className="italic">
              We hope it helps you two plan something beautiful.
            </p>
            <p className="text-warm-400 text-sm mt-6">— Sarah & Gabe ♥</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-8 bg-warm-50/50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl font-serif font-light tracking-wide mb-4 text-warm-800">
            Ready to start?
          </h2>
          <p className="text-warm-600 mb-8">
            Your wedding deserves a planner as thoughtful as you are.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-700 text-white
                       tracking-widest uppercase text-sm hover:bg-warm-800 
                       transition-colors duration-300"
          >
            Start Planning Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 bg-white border-t border-warm-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <Logo size="sm" href={undefined} />
              <p className="text-xs text-warm-400 mt-1">
                Made with love in Utah
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-warm-500">
              <Link href="/register" className="hover:text-warm-700 transition-colors">
                Get Started
              </Link>
              <Link href="/login" className="hover:text-warm-700 transition-colors">
                Sign In
              </Link>
              <a href="mailto:hello@aisleboard.com" className="hover:text-warm-700 transition-colors">
                Contact
              </a>
            </div>

            <div className="text-center md:text-right">
              <div className="flex gap-4 justify-center md:justify-end text-xs text-warm-400 mb-1">
                <Link href="/privacy" className="hover:text-warm-600 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-warm-600 transition-colors">
                  Terms
                </Link>
              </div>
              <p className="text-xs text-warm-400">
                © {new Date().getFullYear()} Aisle
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-warm-100 md:hidden z-50">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full py-3 bg-warm-700 text-white
                     tracking-widest uppercase text-sm hover:bg-warm-800 
                     transition-colors duration-300 rounded-lg"
        >
          Start Planning Free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="h-20 md:hidden" />
    </main>
  );
}
