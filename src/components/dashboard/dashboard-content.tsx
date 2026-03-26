"use client";

import { SiteSummaryCard } from "./site-summary-card";
import { FinancialStrip } from "./financial-strip";
import { NeedsAttentionList } from "./needs-attention-list";
import { QuickAddTask } from "./quick-add-task";
import { useDashboard } from "@/hooks/use-tasks";
import type { Site, Vertical, SubSection } from "@/types";

interface DashboardContentProps {
  sites: Site[];
  verticals: (Vertical & { subSections: SubSection[] })[];
}

export function DashboardContent({ sites, verticals }: DashboardContentProps) {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 rounded-lg animate-shimmer rounded-lg"
            />
          ))}
        </div>
        <div className="h-64 rounded-lg animate-shimmer rounded-lg" />
        <div className="h-24 rounded-lg animate-shimmer rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly stats banner */}
      {data.weeklyStats && (
        <div className="pb-2 border-b border-border">
          <p className="text-sm text-muted-foreground">
            This week &mdash; {data.weeklyStats.tasksAdded} task{data.weeklyStats.tasksAdded !== 1 ? "s" : ""} added, {data.weeklyStats.tasksCompleted} completed
          </p>
        </div>
      )}

      {/* Site summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.siteStats.map((stats) => (
          <SiteSummaryCard key={stats.site.id} stats={stats} />
        ))}
      </div>

      {/* Needs attention — the primary view */}
      <NeedsAttentionList tasks={data.needsAttention} />

      {/* Financial strip — at the bottom */}
      <FinancialStrip summary={data.financialSummary} />

      {/* Floating add button on mobile */}
      <div className="fixed bottom-20 right-4 md:hidden z-40">
        <QuickAddTask sites={sites} verticals={verticals} />
      </div>
    </div>
  );
}
