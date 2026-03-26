"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AveraLogo } from "./avera-logo";
import {
  LayoutDashboard,
  ListTodo,
  IndianRupee,
  CalendarDays,
  Settings,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Site Visits", href: "/visits", icon: CalendarDays },
  { label: "Payments", href: "/payments", icon: IndianRupee },
  { label: "Settings", href: "/settings", icon: Settings },
];

const siteNav = [
  { label: "Avera Nandi", href: "/sites/nandi" },
  { label: "Avera Yogavana", href: "/sites/yogavana" },
  { label: "Avera Chikmagalur", href: "/sites/chikmagalur" },
  { label: "Avera Kabini", href: "/sites/kabini" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-sidebar-border/50">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <AveraLogo />
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNav.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Sites section */}
        <div className="pt-6">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Properties
          </p>
          {siteNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
                )}
              >
                <MapPin className="size-3.5 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40">
          Project Command Center
        </p>
      </div>
    </aside>
  );
}
