"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  IndianRupee,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Visits", href: "/visits", icon: CalendarDays },
  { label: "Payments", href: "/payments", icon: IndianRupee },
  { label: "More", href: "/settings", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] px-2 py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-terracotta"
                  : "text-taupe-light hover:text-taupe"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
