"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-64">
        <div className="px-5 py-6 md:px-10 lg:px-12 md:py-10 pb-20 md:pb-10 animate-page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
