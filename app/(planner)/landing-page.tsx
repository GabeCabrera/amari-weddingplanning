import Link from "next/link";
import { 
  Heart, 
  Calendar, 
  Users, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Check,
  X,
  Shield,
  Zap,
  Clock
} from "lucide-react";
import { PricingSection } from "@/components/pricing-section";
import { Logo } from "@/components/logo";

export function LandingPage() {
  return (
    <main className="min-h-screen select-none">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" href={undefined} />
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-warm-600 hover:text-warm-800 transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 bg-warm-800 text-white rounded-full hover:bg-warm-900 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-rose-50/40 via-white to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-100/60 rounded-full text-sm text-rose-700 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Meet Hera — like a best friend who's planned 1,000 weddings</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight mb-6 text-warm-900">
            Wedding planning,
            <br />
            <span className="text-warm-600">finally simple</span>
          </h1>
          
          <p className="text-xl text-warm-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            The modern wedding planner for couples who want beautiful tools 
            without the chaos. Budget, guests, timeline, vendors — all in one calm space.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-800 text-white
                         text-sm font-medium hover:bg-warm-900 transition-colors rounded-full"
            >
              Start planning free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 border border-warm-200 text-warm-700 
                         text-sm font-medium hover:bg-warm-50 transition-colors rounded-full"
            >
              See how it works
            </Link>
          </div>
          
          <p className="text-sm text-warm-400">
            Free forever · No credit card required · Set up in 60 seconds
          </p>
        </div>

        {/* Product Screenshot */}
        <div className="max-w-5xl mx-auto mt-16 px-6">
          <div className="bg-white rounded-2xl shadow-2xl shadow-warm-200/50 overflow-hidden border border-warm-100">
            {/* Browser Chrome */}
            <div className="bg-warm-50 px-4 py-3 flex items-center gap-3 border-b border-warm-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-warm-200" />
                <div className="w-3 h-3 rounded-full bg-warm-200" />
                <div className="w-3 h-3 rounded-full bg-warm-200" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg px-4 py-1.5 text-sm text-warm-400 max-w-sm mx-auto text-center border border-warm-100">
                  app.aisleboard.com
                </div>
              </div>
            </div>
            
            {/* App Preview */}
            <div className="p-6 bg-warm-50/30">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Sidebar */}
                <div className="hidden md:block bg-white rounded-xl p-4 shadow-sm border border-warm-100">
                  <div className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-4">Planning</div>
                  {["Budget", "Guest List", "Timeline", "Vendors", "Seating"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mb-1 ${i === 0 ? 'bg-warm-100 text-warm-800 font-medium' : 'text-warm-500 hover:bg-warm-50'}`}>
                      <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-rose-400' : 'bg-warm-300'}`} />
                      {item}
                    </div>
                  ))}
                </div>
                
                {/* Main Content */}
                <div className="md:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-warm-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-warm-800">Budget</h3>
                      <p className="text-sm text-warm-400">Track spending across categories</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-semibold text-warm-800">$16,500</div>
                      <div className="text-sm text-warm-400">remaining of $25,000</div>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="h-2 bg-warm-100 rounded-full mb-8 overflow-hidden">
                    <div className="h-full w-1/3 bg-gradient-to-r from-rose-400 to-amber-400 rounded-full" />
                  </div>
                  
                  {/* Items */}
                  <div className="space-y-4">
                    {[
                      { category: "Venue", vendor: "The Garden Estate", cost: "$5,000", status: "Paid" },
                      { category: "Photography", vendor: "Emma Collins Studio", cost: "$2,500", status: "Paid" },
                      { category: "Florals", vendor: "Wildbloom", cost: "$1,000", status: "Deposit" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-warm-100 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-warm-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-warm-500" />
                          </div>
                          <div>
                            <div className="font-medium text-warm-800">{item.category}</div>
                            <div className="text-sm text-warm-400">{item.vendor}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium text-warm-800">{item.cost}</span>
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.status === "Paid" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust Bar */}
      <section className="py-12 px-6 border-y border-warm-100 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-warm-400 mb-6">Trusted by couples planning weddings worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-warm-300">
            <span className="text-2xl font-serif tracking-wide">Featured on</span>
            <span className="text-lg font-medium">The Knot</span>
            <span className="text-lg font-medium">Brides</span>
            <span className="text-lg font-medium">Martha Stewart</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light mb-4 text-warm-900">
              Everything you need, beautifully organized
            </h2>
            <p className="text-lg text-warm-500 max-w-2xl mx-auto">
              Stop juggling spreadsheets and scattered notes. 
              Aisle brings your entire wedding into one elegant workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "Budget Tracker",
                description: "Visual breakdowns, payment tracking, and real-time remaining balance. Never overspend.",
                color: "from-rose-50 to-rose-100/50",
                iconBg: "bg-rose-100",
                iconColor: "text-rose-500",
              },
              {
                icon: Users,
                title: "Guest Management",
                description: "RSVPs, dietary needs, table assignments, and contact info. All synced and searchable.",
                color: "from-amber-50 to-amber-100/50",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-500",
              },
              {
                icon: Calendar,
                title: "Planning Timeline",
                description: "Smart checklists that adapt to your wedding date. Know exactly what to do and when.",
                color: "from-blue-50 to-blue-100/50",
                iconBg: "bg-blue-100",
                iconColor: "text-blue-500",
              },
              {
                icon: Heart,
                title: "Vendor Contacts",
                description: "Store contracts, track payments, and keep all vendor communication in one place.",
                color: "from-pink-50 to-pink-100/50",
                iconBg: "bg-pink-100",
                iconColor: "text-pink-500",
              },
              {
                icon: Sparkles,
                title: "Meet Hera",
                description: "Like texting a friend who happens to know everything about weddings. Available whenever you need her.",
                color: "from-purple-50 to-purple-100/50",
                iconBg: "bg-purple-100",
                iconColor: "text-purple-500",
              },
              {
                icon: Users,
                title: "Seating Charts",
                description: "Drag-and-drop table builder with guest relationships and dietary notes visible.",
                color: "from-teal-50 to-teal-100/50",
                iconBg: "bg-teal-100",
                iconColor: "text-teal-500",
              },
            ].map((feature) => (
              <div 
                key={feature.title}
                className={`bg-gradient-to-br ${feature.color} rounded-2xl p-8 border border-warm-100/50`}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-warm-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-warm-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Aisle */}
      <section className="py-24 px-6 bg-warm-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-serif font-light mb-6 text-warm-900">
                Built different, on purpose
              </h2>
              <p className="text-lg text-warm-600 mb-8 leading-relaxed">
                Most wedding apps are designed to overwhelm you with ads and sell your data to vendors. 
                We took the opposite approach.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: Shield, title: "Privacy-first", desc: "Your data stays yours. We never sell to vendors." },
                  { icon: Zap, title: "Instant setup", desc: "Start planning in 60 seconds. No endless questionnaires." },
                  { icon: Clock, title: "Always available", desc: "Access your planner from any device, anytime." },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white border border-warm-200 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-warm-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-warm-800">{item.title}</h4>
                      <p className="text-sm text-warm-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison */}
            <div className="bg-white rounded-2xl shadow-lg shadow-warm-200/30 overflow-hidden border border-warm-100">
              <div className="grid grid-cols-3">
                <div className="p-4 bg-warm-50 border-b border-warm-100"></div>
                <div className="p-4 bg-warm-100 border-b border-warm-100 text-center">
                  <span className="text-xs font-medium text-warm-500 uppercase tracking-wider">Others</span>
                </div>
                <div className="p-4 bg-warm-800 border-b border-warm-700 text-center">
                  <span className="text-xs font-medium text-white uppercase tracking-wider">Aisle</span>
                </div>

                {[
                  { feature: "Ads", other: "Constant", aisle: "Zero" },
                  { feature: "Data privacy", other: "Sold", aisle: "Protected" },
                  { feature: "Interface", other: "Cluttered", aisle: "Minimal" },
                  { feature: "Setup time", other: "30+ min", aisle: "60 sec" },
                ].map((row, i) => (
                  <div key={row.feature} className="contents">
                    <div className={`p-4 text-sm font-medium text-warm-700 ${i % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'}`}>
                      {row.feature}
                    </div>
                    <div className={`p-4 text-center ${i % 2 === 0 ? 'bg-white' : 'bg-warm-50/50'}`}>
                      <div className="flex items-center justify-center gap-2 text-warm-400 text-sm">
                        <X className="w-4 h-4" />
                        <span>{row.other}</span>
                      </div>
                    </div>
                    <div className={`p-4 text-center ${i % 2 === 0 ? 'bg-warm-50' : 'bg-warm-100/50'}`}>
                      <div className="flex items-center justify-center gap-2 text-warm-700 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{row.aisle}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-light mb-4 text-warm-900">
              Loved by couples everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Finally, a wedding planner that doesn't make me anxious. Everything is exactly where I need it.",
                name: "Sarah M.",
                detail: "Married Oct 2024",
              },
              {
                quote: "I texted Hera at midnight about seating drama and she actually helped. It's like having a wedding planner friend on speed dial.",
                name: "Jessica T.",
                detail: "Engaged",
              },
              {
                quote: "The budget tracker alone saved us from so much stress. We could actually see where our money was going.",
                name: "Amanda & Chris",
                detail: "Married Aug 2024",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-warm-50/50 rounded-2xl p-8 border border-warm-100">
                <p className="text-warm-700 leading-relaxed mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-warm-800">{testimonial.name}</p>
                  <p className="text-sm text-warm-400">{testimonial.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <PricingSection />

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-warm-50 to-rose-50/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-light mb-4 text-warm-900">
            Start planning today
          </h2>
          <p className="text-lg text-warm-600 mb-10">
            Join thousands of couples using Aisle to plan their perfect day.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-warm-800 text-white
                       text-sm font-medium hover:bg-warm-900 transition-colors rounded-full"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-sm text-warm-400 mt-6">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-warm-900 text-warm-300">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-white font-serif text-xl mb-4">Aisle</div>
              <p className="text-sm text-warm-400">
                The modern wedding planner for couples who value simplicity and beauty.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/register" className="block hover:text-white transition-colors">Features</Link>
                <Link href="/choose-plan" className="block hover:text-white transition-colors">Pricing</Link>
                <Link href="/register" className="block hover:text-white transition-colors">Get Started</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:hello@aisleboard.com" className="block hover:text-white transition-colors">Contact</a>
                <Link href="/privacy" className="block hover:text-white transition-colors">Privacy</Link>
                <Link href="/terms" className="block hover:text-white transition-colors">Terms</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-medium mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="mailto:support@aisleboard.com" className="block hover:text-white transition-colors">Help Center</a>
                <a href="mailto:hello@aisleboard.com" className="block hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-warm-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-warm-500">
            <p>© {new Date().getFullYear()} Aisle. All rights reserved.</p>
            <p>Made with care in Salt Lake City</p>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-warm-100 md:hidden z-50">
        <Link
          href="/register"
          className="flex items-center justify-center gap-2 w-full py-3 bg-warm-800 text-white
                     text-sm font-medium hover:bg-warm-900 transition-colors rounded-full"
        >
          Start planning free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="h-20 md:hidden" />
    </main>
  );
}
