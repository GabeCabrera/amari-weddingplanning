"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Settings, BookOpen, Sparkles, Users, TrendingUp, 
  DollarSign, Calendar, Clock, Heart, Send, Plus,
  LayoutGrid, Mail, ExternalLink, ChevronRight,
  RefreshCw, Lightbulb, Palette, ArrowRight, LogOut, Menu
} from "lucide-react";

interface InspirationData {
  displayName: string;
  daysUntil: number | null;
  phase: string;
  weddingDate: string | null;
  moodBoards: MoodBoard[];
  quickPrompts: string[];
  communityInsights: CommunityInsight[];
  nudges: PersonalizedNudge[];
  seasonal: {
    current: SeasonalIdea;
    weddingMonth: SeasonalIdea | null;
  };
  resources: Resource[];
}

interface MoodBoard {
  id: string;
  name: string;
  description: string;
  colors: string[];
  keywords: string[];
}

interface CommunityInsight {
  type: "stat" | "trend" | "tip";
  icon: string;
  title: string;
  description: string;
  source: "community";
}

interface PersonalizedNudge {
  type: "action" | "milestone" | "reminder";
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  priority: "high" | "medium" | "low";
}

interface SeasonalIdea {
  month: number;
  theme: string;
  ideas: string[];
  colorPalette: string[];
}

interface Resource {
  title: string;
  description: string;
  url: string;
  category: string;
}

interface HomeClientProps {
  displayName: string;
  hasStartedPlanning: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, TrendingUp, DollarSign, Calendar, Clock, Heart, Send, Plus, LayoutGrid, Mail, Sparkles, Lightbulb,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || Sparkles;
}

export function HomeClient({ displayName, hasStartedPlanning }: HomeClientProps) {
  const [data, setData] = useState<InspirationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchInspirations = async () => {
    try {
      const res = await fetch("/api/inspirations");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch inspirations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInspirations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInspirations();
  };

  return (
    <main className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/" className="text-lg md:text-xl font-serif tracking-widest uppercase">
              Aisle
            </Link>
            <span className="text-warm-300 hidden sm:inline">|</span>
            <span className="text-sm text-warm-500 hidden sm:inline">{displayName}</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/settings"
              className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-500 hover:text-warm-600 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-xs tracking-wider uppercase text-warm-500 hover:text-warm-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 -mr-2 hover:bg-warm-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-warm-600" />
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-warm-200 bg-white px-4 py-3 space-y-3">
            <p className="text-sm text-warm-500">{displayName}</p>
            <Link
              href="/settings"
              className="flex items-center gap-2 text-sm text-warm-600 py-2"
              onClick={() => setMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 text-sm text-warm-600 py-2 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-light tracking-wide mb-1 md:mb-2">
                {data?.daysUntil !== null && data?.daysUntil !== undefined
                  ? data.daysUntil > 0
                    ? `${data.daysUntil} days to go`
                    : data.daysUntil === 0
                    ? "Today's the day! 💒"
                    : "Congratulations! 🎉"
                  : "Welcome back"}
              </h1>
              <p className="text-sm md:text-base text-warm-500">
                {hasStartedPlanning
                  ? "Continue planning or find inspiration below."
                  : "Let's make your wedding dreams come true."}
              </p>
            </div>
            <Link href={hasStartedPlanning ? "/planner" : "/templates"} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-warm-700 hover:bg-warm-800 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                {hasStartedPlanning ? "Open Planner" : "Start Planning"}
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-warm-400 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-8 md:space-y-12">
            {/* Personalized Nudges */}
            {data.nudges.length > 0 && data.nudges.some(n => n.priority === "high") && (
              <section>
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base md:text-lg font-medium text-warm-700">For You</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {data.nudges.map((nudge, idx) => {
                    const Icon = getIcon(nudge.icon);
                    return (
                      <div
                        key={idx}
                        className={`p-4 md:p-5 rounded-lg border ${
                          nudge.priority === "high"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white border-warm-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            nudge.priority === "high" ? "bg-amber-100" : "bg-warm-100"
                          }`}>
                            <Icon className={`w-4 h-4 md:w-5 md:h-5 ${
                              nudge.priority === "high" ? "text-amber-600" : "text-warm-600"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-warm-800 mb-1 text-sm md:text-base">{nudge.title}</h3>
                            <p className="text-xs md:text-sm text-warm-500 mb-2 md:mb-3">{nudge.description}</p>
                            {nudge.action && (
                              <Link
                                href={nudge.action.href}
                                className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-warm-700 hover:text-warm-900"
                              >
                                {nudge.action.label}
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Quick Prompts */}
            <section>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h2 className="text-base md:text-lg font-medium text-warm-700">Have you thought about...</h2>
                <button
                  onClick={handleRefresh}
                  className="ml-auto p-1 hover:bg-warm-100 rounded transition-colors"
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-4 h-4 text-warm-400 ${refreshing ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {data.quickPrompts.map((prompt, idx) => (
                  <div
                    key={idx}
                    className="p-4 md:p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100"
                  >
                    <p className="text-sm md:text-base text-warm-700 font-medium">{prompt}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Mood Boards */}
            <section>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <Palette className="w-5 h-5 text-pink-500" />
                <h2 className="text-base md:text-lg font-medium text-warm-700">Style Inspiration</h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {data.moodBoards.map((board) => (
                  <div
                    key={board.id}
                    className="bg-white rounded-lg border border-warm-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-16 md:h-20">
                      {board.colors.map((color, idx) => (
                        <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="font-medium text-warm-800 mb-1 text-sm md:text-base">{board.name}</h3>
                      <p className="text-xs md:text-sm text-warm-500 line-clamp-2">{board.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Insights */}
            {data.communityInsights.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h2 className="text-base md:text-lg font-medium text-warm-700">From the Community</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {data.communityInsights.map((insight, idx) => {
                    const Icon = getIcon(insight.icon);
                    return (
                      <div key={idx} className="p-4 md:p-5 bg-white rounded-lg border border-warm-200">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-warm-800 mb-1 text-sm md:text-base">{insight.title}</h3>
                            <p className="text-xs md:text-sm text-warm-500">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Seasonal Ideas */}
            <section className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                  <h3 className="text-sm md:text-base font-medium text-green-800">Trending This Month</h3>
                </div>
                <h4 className="text-lg md:text-xl font-serif text-green-900 mb-2 md:mb-3">{data.seasonal.current.theme}</h4>
                <div className="flex gap-2 mb-3 md:mb-4">
                  {data.seasonal.current.colorPalette.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <ul className="space-y-1 md:space-y-2">
                  {data.seasonal.current.ideas.map((idea, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs md:text-sm text-green-700">
                      <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>

              {data.seasonal.weddingMonth && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg border border-rose-100 p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <Heart className="w-4 h-4 md:w-5 md:h-5 text-rose-600" />
                    <h3 className="text-sm md:text-base font-medium text-rose-800">For Your Wedding Month</h3>
                  </div>
                  <h4 className="text-lg md:text-xl font-serif text-rose-900 mb-2 md:mb-3">{data.seasonal.weddingMonth.theme}</h4>
                  <div className="flex gap-2 mb-3 md:mb-4">
                    {data.seasonal.weddingMonth.colorPalette.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <ul className="space-y-1 md:space-y-2">
                    {data.seasonal.weddingMonth.ideas.map((idea, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs md:text-sm text-rose-700">
                        <span className="w-1 h-1 md:w-1.5 md:h-1.5 bg-rose-400 rounded-full flex-shrink-0" />
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Curated Resources */}
            <section>
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <ExternalLink className="w-5 h-5 text-warm-500" />
                <h2 className="text-base md:text-lg font-medium text-warm-700">Helpful Resources</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {data.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 md:p-5 bg-white rounded-lg border border-warm-200 hover:border-warm-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-warm-800 mb-1 text-sm md:text-base group-hover:text-warm-900">
                          {resource.title}
                        </h3>
                        <p className="text-xs md:text-sm text-warm-500 line-clamp-2">{resource.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-warm-400 group-hover:text-warm-600 transition-colors flex-shrink-0 ml-2" />
                    </div>
                  </a>
                ))}
              </div>
            </section>

            {/* Lower Priority Nudges */}
            {data.nudges.length > 0 && !data.nudges.some(n => n.priority === "high") && (
              <section>
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Lightbulb className="w-5 h-5 text-warm-500" />
                  <h2 className="text-base md:text-lg font-medium text-warm-700">Suggestions</h2>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {data.nudges.map((nudge, idx) => {
                    const Icon = getIcon(nudge.icon);
                    return (
                      <div key={idx} className="p-4 md:p-5 bg-white rounded-lg border border-warm-200">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-warm-100 rounded-lg flex-shrink-0">
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-warm-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-warm-800 mb-1 text-sm md:text-base">{nudge.title}</h3>
                            <p className="text-xs md:text-sm text-warm-500 mb-2 md:mb-3">{nudge.description}</p>
                            {nudge.action && (
                              <Link
                                href={nudge.action.href}
                                className="inline-flex items-center gap-1 text-xs md:text-sm font-medium text-warm-700 hover:text-warm-900"
                              >
                                {nudge.action.label}
                                <ChevronRight className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-warm-500">Unable to load inspirations. Please try again.</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
