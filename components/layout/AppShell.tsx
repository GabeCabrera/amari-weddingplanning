"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  MessageSquare,
  LayoutDashboard,
  CheckCircle,
  DollarSign,
  Users,
  Store,
  Calendar,
  Image,
  Settings,
  ChevronLeft,
  ChevronDown,
  LogOut,
} from "lucide-react";

/**
 * Aisle App Shell - Rebuilt for reliability
 * Clean implementation with working navigation
 */

// Logo component
export function AisleLogo({ 
  size = 32, 
  color = "#D4A69C",
  className = "" 
}: { 
  size?: number; 
  color?: string;
  className?: string;
}) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M 4 22 C 4 14, 8 12, 14 12 C 21 12, 24 15, 24 22 C 24 29, 20 32, 14 32 C 7 32, 4 28, 4 22"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 16 22 C 16 14, 20 12, 26 12 C 33 12, 36 15, 36 22 C 36 29, 32 32, 26 32 C 19 32, 16 28, 16 22"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

// Navigation configuration
const mainNavItems = [
  { href: "/", label: "Chat", icon: MessageSquare },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/checklist", label: "Checklist", icon: CheckCircle },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/guests", label: "Guests", icon: Users },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/timeline", label: "Timeline", icon: Calendar },
  { href: "/inspo", label: "Inspo", icon: Image },
];

const bottomNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = session?.user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  // Handle navigation programmatically to ensure it works
  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white border-r border-stone-200
          transition-all duration-300 ease-out
          ${sidebarOpen ? "w-64" : "w-20"}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-stone-100">
          <button 
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-3 group"
          >
            <div className="transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3">
              <AisleLogo size={36} color="#D4A69C" />
            </div>
            {sidebarOpen && (
              <span className="font-serif text-xl tracking-wide text-ink group-hover:text-rose-600 transition-colors duration-200">
                Aisle
              </span>
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = isActivePath(item.href);
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left
                  transition-colors duration-200 ease-out
                  ${isActive 
                    ? "bg-rose-100 text-rose-700 shadow-sm" 
                    : "text-ink-soft hover:bg-stone-50 hover:text-ink"
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? "text-rose-600" : "group-hover:scale-110"
                  }`} 
                />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="py-4 px-3 border-t border-stone-100 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = isActivePath(item.href);
            const Icon = item.icon;
            
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-left
                  transition-colors duration-200 ease-out
                  ${isActive 
                    ? "bg-rose-100 text-rose-700 shadow-sm" 
                    : "text-ink-soft hover:bg-stone-50 hover:text-ink"
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? "text-rose-600" : "group-hover:scale-110"
                  }`} 
                />
                {sidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
              text-ink-soft hover:bg-stone-50 hover:text-ink transition-all duration-200"
          >
            <ChevronLeft 
              className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
                sidebarOpen ? "" : "rotate-180"
              }`} 
            />
            {sidebarOpen && (
              <span className="font-medium text-sm">Collapse</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-50 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md">
                {initials}
              </div>
              {session?.user?.name && (
                <span className="text-sm font-medium text-ink hidden sm:block group-hover:text-rose-600 transition-colors">
                  {session.user.name}
                </span>
              )}
              <ChevronDown className="w-4 h-4 text-ink-soft transition-transform duration-200 group-hover:translate-y-0.5" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-sm font-medium text-ink">{session?.user?.name}</p>
                    <p className="text-xs text-ink-soft truncate">{session?.user?.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-stone-50 hover:text-ink transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-soft hover:bg-red-50 hover:text-red-600 w-full text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
