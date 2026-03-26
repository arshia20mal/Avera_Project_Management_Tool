"use client";

import { VerticalAccordion } from "./vertical-accordion";
import { useTasks } from "@/hooks/use-tasks";
import type { Site, Vertical, SubSection } from "@/types";

interface SiteDetailContentProps {
  site: Site;
  verticals: Vertical[];
  subSections: SubSection[];
}

export function SiteDetailContent({
  site,
  verticals,
  subSections,
}: SiteDetailContentProps) {
  const { data, isLoading } = useTasks({
    siteId: site.id,
    pageSize: 500, // Get all tasks for this site
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-ivory-light animate-pulse" />
        ))}
      </div>
    );
  }

  const tasks = data.items;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const percentage =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">{percentage}%</span>
          <span className="text-muted-foreground">complete</span>
        </div>
        <div className="flex-1 h-2 rounded-full bg-ivory">
          <div
            className="h-full rounded-full bg-leaf-accent transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-muted-foreground">
          {completedTasks}/{tasks.length} tasks
        </span>
      </div>

      <VerticalAccordion
        verticals={verticals}
        subSections={subSections}
        tasks={tasks}
      />
    </div>
  );
}
