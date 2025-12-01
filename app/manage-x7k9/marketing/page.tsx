"use client";

import { useState } from "react";
import { 
  Heart, 
  Check, 
  X, 
  Calendar, 
  Users, 
  DollarSign,
  Sparkles,
  Star,
  Clock,
  Shield
} from "lucide-react";

export default function MarketingAssetsPage() {
  const [selectedAd, setSelectedAd] = useState<number | null>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-warm-800 mb-2">Marketing Assets</h1>
        <p className="text-warm-500">Click any ad to view full-screen for screenshots</p>
      </div>

      {/* Ad Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Ad 1: Emotional Hero */}
        <div 
          onClick={() => setSelectedAd(1)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-gradient-to-br from-warm-50 to-warm-100 rounded-lg shadow-lg overflow-hidden border border-warm-200">
            <Ad1Emotional />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">1. Emotional Hero (1:1)</p>
        </div>

        {/* Ad 2: Pricing Comparison */}
        <div 
          onClick={() => setSelectedAd(2)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-white rounded-lg shadow-lg overflow-hidden border border-warm-200">
            <Ad2Pricing />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">2. Pricing Hook (1:1)</p>
        </div>

        {/* Ad 3: Features */}
        <div 
          onClick={() => setSelectedAd(3)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-warm-600 rounded-lg shadow-lg overflow-hidden">
            <Ad3Features />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">3. Features (1:1)</p>
        </div>

        {/* Ad 4: Us vs Them */}
        <div 
          onClick={() => setSelectedAd(4)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-white rounded-lg shadow-lg overflow-hidden border border-warm-200">
            <Ad4Comparison />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">4. Comparison (1:1)</p>
        </div>

        {/* Ad 5: Problem/Solution */}
        <div 
          onClick={() => setSelectedAd(5)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-gradient-to-br from-rose-50 to-warm-50 rounded-lg shadow-lg overflow-hidden border border-warm-200">
            <Ad5ProblemSolution />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">5. Problem/Solution (1:1)</p>
        </div>

        {/* Ad 6: Social Proof */}
        <div 
          onClick={() => setSelectedAd(6)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-square bg-warm-800 rounded-lg shadow-lg overflow-hidden">
            <Ad6SocialProof />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">6. Social Proof (1:1)</p>
        </div>
      </div>

      {/* Landscape Ads */}
      <h2 className="text-xl font-serif text-warm-800 mt-12 mb-6">Landscape Formats (16:9)</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ad 7: Landscape Hero */}
        <div 
          onClick={() => setSelectedAd(7)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-video bg-gradient-to-r from-warm-100 to-rose-50 rounded-lg shadow-lg overflow-hidden border border-warm-200">
            <Ad7LandscapeHero />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">7. Landscape Hero (16:9)</p>
        </div>

        {/* Ad 8: Landscape Features */}
        <div 
          onClick={() => setSelectedAd(8)}
          className="cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="aspect-video bg-warm-700 rounded-lg shadow-lg overflow-hidden">
            <Ad8LandscapeFeatures />
          </div>
          <p className="text-sm text-warm-500 mt-2 text-center">8. Landscape Features (16:9)</p>
        </div>
      </div>

      {/* Full Screen Modal */}
      {selectedAd && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setSelectedAd(null)}
        >
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            {selectedAd === 1 && <div className="aspect-square bg-gradient-to-br from-warm-50 to-warm-100 rounded-lg overflow-hidden"><Ad1Emotional /></div>}
            {selectedAd === 2 && <div className="aspect-square bg-white rounded-lg overflow-hidden"><Ad2Pricing /></div>}
            {selectedAd === 3 && <div className="aspect-square bg-warm-600 rounded-lg overflow-hidden"><Ad3Features /></div>}
            {selectedAd === 4 && <div className="aspect-square bg-white rounded-lg overflow-hidden"><Ad4Comparison /></div>}
            {selectedAd === 5 && <div className="aspect-square bg-gradient-to-br from-rose-50 to-warm-50 rounded-lg overflow-hidden"><Ad5ProblemSolution /></div>}
            {selectedAd === 6 && <div className="aspect-square bg-warm-800 rounded-lg overflow-hidden"><Ad6SocialProof /></div>}
            {selectedAd === 7 && <div className="aspect-video bg-gradient-to-r from-warm-100 to-rose-50 rounded-lg overflow-hidden"><Ad7LandscapeHero /></div>}
            {selectedAd === 8 && <div className="aspect-video bg-warm-700 rounded-lg overflow-hidden"><Ad8LandscapeFeatures /></div>}
            <p className="text-white text-center mt-4 text-sm">Click outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Ad 1: Emotional Hero
function Ad1Emotional() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <Heart className="w-12 h-12 text-rose-400 mb-6" />
      <p className="text-sm tracking-[0.3em] uppercase text-warm-400 mb-4">Aisle</p>
      <h2 className="text-3xl md:text-4xl font-serif font-light text-warm-800 mb-4 leading-tight">
        Plan Your Wedding
        <br />
        <span className="text-warm-600">Without the Stress</span>
      </h2>
      <p className="text-warm-600 mb-8 max-w-xs">
        A calm, beautiful space for you and your partner to plan your perfect day together.
      </p>
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-warm-600 text-white text-sm tracking-wider uppercase">
        Start Free
      </div>
      <p className="text-xs text-warm-400 mt-4">No credit card required</p>
    </div>
  );
}

// Ad 2: Pricing Hook
function Ad2Pricing() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        <span className="text-6xl font-serif text-warm-700">$29</span>
        <p className="text-warm-500 text-sm mt-1">one-time payment</p>
      </div>
      
      <div className="w-16 h-px bg-warm-300 mb-6" />
      
      <h2 className="text-2xl font-serif text-warm-800 mb-4">
        No Monthly Fees.<br />Ever.
      </h2>
      
      <div className="space-y-2 text-left mb-6">
        <div className="flex items-center gap-2 text-warm-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">Unlimited planning tools</span>
        </div>
        <div className="flex items-center gap-2 text-warm-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">Guest list & RSVP tracking</span>
        </div>
        <div className="flex items-center gap-2 text-warm-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">Budget management</span>
        </div>
        <div className="flex items-center gap-2 text-warm-600">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-sm">Google Calendar sync</span>
        </div>
      </div>
      
      <p className="text-xs text-warm-400 tracking-wider uppercase">aisleboard.com</p>
    </div>
  );
}

// Ad 3: Features (Dark)
function Ad3Features() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white">
      <p className="text-sm tracking-[0.3em] uppercase text-warm-300 mb-6">Aisle</p>
      
      <h2 className="text-2xl font-serif font-light mb-8">
        Everything You Need
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <DollarSign className="w-5 h-5" />
          </div>
          <span className="text-xs">Budget</span>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs">Guest List</span>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs">Timeline</span>
        </div>
        <div className="flex flex-col items-center p-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs">Seating</span>
        </div>
      </div>
      
      <p className="text-warm-300 text-sm">No spreadsheets. No chaos.</p>
    </div>
  );
}

// Ad 4: Comparison
function Ad4Comparison() {
  return (
    <div className="h-full flex flex-col p-6">
      <h2 className="text-xl font-serif text-warm-800 text-center mb-6">
        Why Couples Switch to Aisle
      </h2>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center text-warm-400 text-xs uppercase tracking-wider pb-2">Others</div>
          <div className="text-center text-warm-600 text-xs uppercase tracking-wider pb-2">Aisle</div>
          
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-warm-500">$20-40/month</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100 bg-green-50">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-warm-700 font-medium">$29 once</span>
          </div>
          
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-warm-500">Vendor ads</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100 bg-green-50">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-warm-700 font-medium">Zero ads</span>
          </div>
          
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-warm-500">Cluttered</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100 bg-green-50">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-warm-700 font-medium">Minimal</span>
          </div>
          
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100">
            <X className="w-4 h-4 text-red-400" />
            <span className="text-warm-500">Data sold</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-2 border-t border-warm-100 bg-green-50">
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-warm-700 font-medium">Private</span>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-warm-400 text-center mt-4 tracking-wider uppercase">aisleboard.com</p>
    </div>
  );
}

// Ad 5: Problem/Solution
function Ad5ProblemSolution() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        <p className="text-warm-500 text-sm mb-2">Tired of...</p>
        <div className="space-y-1 text-warm-600">
          <p className="line-through opacity-60">Overwhelming planning apps</p>
          <p className="line-through opacity-60">Monthly subscription fees</p>
          <p className="line-through opacity-60">Vendor spam in your inbox</p>
        </div>
      </div>
      
      <div className="w-12 h-px bg-warm-300 mb-8" />
      
      <Sparkles className="w-8 h-8 text-warm-500 mb-4" />
      
      <h2 className="text-2xl font-serif text-warm-800 mb-4">
        Try Aisle Instead
      </h2>
      
      <p className="text-warm-600 text-sm mb-6 max-w-xs">
        A calm, ad-free wedding planner that&apos;s actually enjoyable to use.
      </p>
      
      <div className="inline-flex items-center gap-2 px-5 py-2 bg-warm-600 text-white text-sm tracking-wider uppercase rounded">
        Start Free
      </div>
    </div>
  );
}

// Ad 6: Social Proof (Dark)
function Ad6SocialProof() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white">
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      
      <blockquote className="text-xl font-serif font-light mb-6 leading-relaxed max-w-xs">
        &ldquo;Finally, a wedding planner that doesn&apos;t make me want to pull my hair out.&rdquo;
      </blockquote>
      
      <p className="text-warm-400 text-sm mb-8">— Sarah & James, 2025</p>
      
      <div className="w-12 h-px bg-warm-600 mb-6" />
      
      <p className="text-sm tracking-[0.3em] uppercase text-warm-400">Aisle</p>
      <p className="text-xs text-warm-500 mt-1">The stress-free wedding planner</p>
    </div>
  );
}

// Ad 7: Landscape Hero
function Ad7LandscapeHero() {
  return (
    <div className="h-full flex items-center justify-between p-8">
      <div className="flex-1">
        <p className="text-sm tracking-[0.3em] uppercase text-warm-400 mb-3">Aisle</p>
        <h2 className="text-3xl font-serif font-light text-warm-800 mb-4 leading-tight">
          Plan Your Wedding<br />
          <span className="text-warm-600">Without the Chaos</span>
        </h2>
        <p className="text-warm-600 mb-6 text-sm max-w-sm">
          A calm, beautiful space for you and your partner. No ads, no spam, no stress.
        </p>
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-warm-600 text-white text-sm tracking-wider uppercase">
            Start Free
          </div>
          <span className="text-warm-500 text-sm">$29 one-time</span>
        </div>
      </div>
      
      <div className="hidden md:flex flex-col items-center justify-center flex-1">
        <Heart className="w-20 h-20 text-rose-300" />
      </div>
    </div>
  );
}

// Ad 8: Landscape Features
function Ad8LandscapeFeatures() {
  return (
    <div className="h-full flex items-center p-8 text-white">
      <div className="flex-1">
        <p className="text-sm tracking-[0.3em] uppercase text-warm-300 mb-3">Aisle</p>
        <h2 className="text-2xl font-serif font-light mb-2">
          Everything in One Place
        </h2>
        <p className="text-warm-300 text-sm">No more scattered spreadsheets</p>
      </div>
      
      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className="text-xs">Budget</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-xs">Guests</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-xs">Timeline</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-xs">Day-of</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-xs">Private</span>
        </div>
      </div>
    </div>
  );
}
