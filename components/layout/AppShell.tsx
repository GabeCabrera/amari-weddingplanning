"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  X, 
  Home,
  LayoutGrid,
  MessageCircle,
  Settings,
  DollarSign,
  Users,
  Store,
  Calendar,
  CheckCircle,
  Sparkles,
  LayoutDashboard,
  ChevronDown,
  LogOut,
  User
} from "lucide-react";

// =============================================================================
// AISLE LOGO
// =============================================================================

export function AisleLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <path d="M 4 22 C 4 14, 8 12, 14 12 C 21 12, 24 15, 24 22 C 24 29, 20 32, 14 32 C 7 32, 4 28, 4 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 16 22 C 16 14, 20 12, 26 12 C 33 12, 36 15, 36 22 C 36 29, 32 32, 26 32 C 19 32, 16 28, 16 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// =============================================================================
// TOOL DEFINITIONS
// =============================================================================

const tools = [
  { 
    id: "dashboard", 
    label: "Dashboard", 
    description: "Your wedding overview",
    icon: LayoutDashboard,
    color: "bg-rose-500"
  },
  { 
    id: "budget", 
    label: "Budget", 
    description: "Track expenses",
    icon: DollarSign,
    color: "bg-emerald-500"
  },
  { 
    id: "guests", 
    label: "Guests", 
    description: "Manage RSVPs",
    icon: Users,
    color: "bg-blue-500"
  },
  { 
    id: "vendors", 
    label: "Vendors", 
    description: "Your team",
    icon: Store,
    color: "bg-purple-500"
  },
  { 
    id: "timeline", 
    label: "Timeline", 
    description: "Day-of schedule",
    icon: Calendar,
    color: "bg-amber-500"
  },
  { 
    id: "checklist", 
    label: "Checklist", 
    description: "To-do list",
    icon: CheckCircle,
    color: "bg-teal-500"
  },
  { 
    id: "inspo", 
    label: "Inspo", 
    description: "Save ideas",
    icon: Sparkles,
    color: "bg-pink-500"
  },
  { 
    id: "settings", 
    label: "Settings", 
    description: "Preferences",
    icon: Settings,
    color: "bg-slate-500"
  },
];

// =============================================================================
// BOTTOM SHEET (Pinterest-style slide up)
// =============================================================================

function BottomSheet({ 
  isOpen, 
  onClose, 
  children,
  title
}: { 
  isOpen: boolean; 
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div 
        className={`absolute inset-x-0 bottom-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ maxHeight: "85vh" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-stone-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-stone-100">
            <h2 className="font-serif text-xl text-stone-800">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 60px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// FULL SCREEN MODAL (for tools)
// =============================================================================

function FullScreenModal({ 
  isOpen, 
  onClose, 
  toolId 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  toolId: string;
}) {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  const tool = tools.find(t => t.id === toolId);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    
    setLoading(true);
    const loadComponent = async () => {
      try {
        let mod;
        switch (toolId) {
          case "dashboard":
            mod = await import("@/components/tools/DashboardTool");
            break;
          case "budget":
            mod = await import("@/components/tools/BudgetTool");
            break;
          case "guests":
            mod = await import("@/components/tools/GuestsTool");
            break;
          case "vendors":
            mod = await import("@/components/tools/VendorsTool");
            break;
          case "timeline":
            mod = await import("@/components/tools/TimelineTool");
            break;
          case "checklist":
            mod = await import("@/components/tools/ChecklistTool");
            break;
          case "inspo":
            mod = await import("@/components/tools/InspoTool");
            break;
          case "settings":
            mod = await import("@/components/tools/SettingsTool");
            break;
        }
        if (mod?.default) {
          setComponent(() => mod.default);
        }
      } catch (err) {
        console.error("Failed to load component:", err);
      } finally {
        setLoading(false);
      }
    };
    loadComponent();
  }, [isOpen, toolId]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Modal slides up from bottom on mobile, fades in on desktop */}
      <div 
        className={`
          absolute inset-0 bg-white
          transition-all duration-300 ease-out
          md:inset-4 md:rounded-3xl md:shadow-2xl
          ${isAnimating 
            ? "translate-y-0 opacity-100" 
            : "translate-y-full md:translate-y-0 md:opacity-0 md:scale-95"
          }
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-stone-100">
          <div className="flex items-center justify-between px-4 h-14 md:h-16">
            {/* Back/Close button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-stone-600 hover:text-stone-900 transition-colors -ml-2 p-2 rounded-xl hover:bg-stone-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            
            {/* Title */}
            <div className="flex items-center gap-2">
              {tool?.icon && (
                <div className={`w-8 h-8 rounded-xl ${tool.color} flex items-center justify-center`}>
                  <tool.icon className="w-4 h-4 text-white" />
                </div>
              )}
              <h2 className="font-serif text-lg text-stone-800">{tool?.label}</h2>
            </div>
            
            {/* Spacer for centering */}
            <div className="w-16" />
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-3.5rem)] md:h-[calc(100%-4rem)]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2 text-stone-400">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          ) : Component ? (
            <Component />
          ) : (
            <div className="p-8 text-center text-stone-500">Could not load content</div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// TOOLS GRID (Pinterest board-style)
// =============================================================================

function ToolsGrid({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  return (
    <div className="p-4 pb-8">
      <div className="grid grid-cols-4 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="flex flex-col items-center p-3 rounded-2xl hover:bg-stone-50 active:bg-stone-100 transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl ${tool.color} flex items-center justify-center mb-2 group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg shadow-black/10`}>
              <tool.icon className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs font-medium text-stone-700 text-center leading-tight">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// PROFILE MENU
// =============================================================================

function ProfileMenu({ onSelectTool }: { onSelectTool: (id: string) => void }) {
  const { data: session } = useSession();
  
  const initials = session?.user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <div className="p-4 pb-8">
      {/* User info */}
      <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white text-lg font-medium shadow-lg">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-stone-800 truncate">{session?.user?.name}</p>
          <p className="text-sm text-stone-500 truncate">{session?.user?.email}</p>
        </div>
      </div>
      
      {/* Menu items */}
      <div className="space-y-1">
        <button
          onClick={() => onSelectTool("settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-stone-50 active:bg-stone-100 transition-colors"
        >
          <User className="w-5 h-5 text-stone-500" />
          <span className="text-stone-700">Account Settings</span>
        </button>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// BOTTOM NAV (Pinterest-style)
// =============================================================================

function BottomNav({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = [
    { id: "chat", icon: MessageCircle, label: "Chat" },
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "tools", icon: LayoutGrid, label: "Tools" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/80 backdrop-blur-xl border-t border-stone-200 pb-safe">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex flex-col items-center justify-center w-16 h-full
                transition-all duration-200
                ${isActive ? "text-rose-500" : "text-stone-400 hover:text-stone-600"}
              `}
            >
              <div className={`
                p-2 rounded-2xl transition-all duration-200
                ${isActive ? "bg-rose-50 scale-110" : "hover:bg-stone-50"}
              `}>
                <tab.icon className={`w-6 h-6 transition-all ${isActive ? "stroke-[2.5]" : ""}`} />
              </div>
              <span className={`text-[10px] font-medium mt-0.5 transition-opacity ${isActive ? "opacity-100" : "opacity-70"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// =============================================================================
// DESKTOP HEADER
// =============================================================================

function DesktopHeader({ onOpenTool }: { onOpenTool: (id: string) => void }) {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  
  const initials = session?.user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="hidden md:flex fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-stone-100 z-40">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <AisleLogo size={36} className="text-rose-400" />
          <span className="font-serif text-xl text-stone-800">Aisle</span>
        </div>

        {/* Center nav */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-full">
          {tools.slice(0, 6).map((tool) => (
            <button
              key={tool.id}
              onClick={() => onOpenTool(tool.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-stone-600 hover:bg-white hover:text-stone-900 hover:shadow-sm transition-all"
            >
              <tool.icon className="w-4 h-4" />
              <span className="hidden lg:inline">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
              {initials}
            </div>
            <ChevronDown className={`w-4 h-4 text-stone-500 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-stone-100">
                  <p className="font-medium text-stone-800 truncate">{session?.user?.name}</p>
                  <p className="text-sm text-stone-500 truncate">{session?.user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      onOpenTool("settings");
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-600 hover:bg-stone-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// =============================================================================
// MAIN APP SHELL
// =============================================================================

export function AppShell({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [toolsSheetOpen, setToolsSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleTabChange = useCallback((tab: string) => {
    if (tab === "tools") {
      setToolsSheetOpen(true);
    } else if (tab === "profile") {
      setProfileSheetOpen(true);
    } else if (tab === "dashboard") {
      setActiveModal("dashboard");
      setActiveTab("chat"); // Reset to chat after opening
    } else {
      setActiveTab(tab);
    }
  }, []);

  const handleSelectTool = useCallback((toolId: string) => {
    setToolsSheetOpen(false);
    setProfileSheetOpen(false);
    setActiveModal(toolId);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Desktop header */}
      <DesktopHeader onOpenTool={handleSelectTool} />
      
      {/* Main content */}
      <main className="pb-20 md:pb-0 md:pt-16">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      {/* Tools bottom sheet (mobile) */}
      <BottomSheet 
        isOpen={toolsSheetOpen} 
        onClose={() => setToolsSheetOpen(false)}
        title="Tools"
      >
        <ToolsGrid onSelectTool={handleSelectTool} />
      </BottomSheet>

      {/* Profile bottom sheet (mobile) */}
      <BottomSheet 
        isOpen={profileSheetOpen} 
        onClose={() => setProfileSheetOpen(false)}
        title="Profile"
      >
        <ProfileMenu onSelectTool={handleSelectTool} />
      </BottomSheet>

      {/* Tool modal */}
      {activeModal && (
        <FullScreenModal 
          isOpen={!!activeModal}
          onClose={() => setActiveModal(null)}
          toolId={activeModal}
        />
      )}
    </div>
  );
}

export default AppShell;
