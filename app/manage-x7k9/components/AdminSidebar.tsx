"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  FileText,
  Tag,
  Activity,
  Settings,
  ExternalLink,
  LogOut,
  Sparkles,
} from "lucide-react";

interface AdminSidebarProps {
  userEmail: string;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/manage-x7k9",
    icon: LayoutDashboard,
    description: "Overview & analytics",
  },
  {
    label: "Users",
    href: "/manage-x7k9/users",
    icon: Users,
    description: "Manage customers",
  },
  {
    label: "Email",
    href: "/manage-x7k9/email",
    icon: Mail,
    description: "Broadcasts & subscribers",
  },
  {
    label: "Templates",
    href: "/manage-x7k9/templates",
    icon: FileText,
    description: "Wedding planner templates",
  },
  {
    label: "Discounts",
    href: "/manage-x7k9/settings",
    icon: Tag,
    description: "Promo codes & pricing",
  },
];

const externalLinks = [
  {
    label: "Stripe Dashboard",
    href: "https://dashboard.stripe.com",
    icon: Sparkles,
  },
  {
    label: "Vercel",
    href: "https://vercel.com/dashboard",
    icon: Activity,
  },
  {
    label: "Resend",
    href: "https://resend.com/emails",
    icon: Mail,
  },
];

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-warm-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-warm-800">
        <Link href="/manage-x7k9" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warm-700 rounded-lg flex items-center justify-center">
            <span className="text-lg font-serif">A</span>
          </div>
          <div>
            <h1 className="font-serif tracking-wider text-sm uppercase">Aisle</h1>
            <p className="text-xs text-warm-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-warm-500 uppercase tracking-wider px-3 mb-3">
          Management
        </p>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/manage-x7k9" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                isActive
                  ? "bg-warm-700 text-white"
                  : "text-warm-300 hover:bg-warm-800 hover:text-white"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-warm-400 group-hover:text-warm-200"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className={`text-xs truncate ${isActive ? "text-warm-300" : "text-warm-500"}`}>
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}

        {/* External Links */}
        <div className="pt-6 mt-6 border-t border-warm-800">
          <p className="text-xs text-warm-500 uppercase tracking-wider px-3 mb-3">
            External
          </p>
          
          {externalLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-warm-400 hover:bg-warm-800 hover:text-white transition-colors group"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </a>
          ))}
        </div>
      </nav>

      {/* User & Back to Site */}
      <div className="p-4 border-t border-warm-800 space-y-2">
        <div className="px-3 py-2">
          <p className="text-xs text-warm-500">Logged in as</p>
          <p className="text-sm text-warm-300 truncate">{userEmail}</p>
        </div>
        
        <Link
          href="/planner"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-warm-400 hover:bg-warm-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Back to Planner</span>
        </Link>
      </div>
    </aside>
  );
}
