"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, AlertTriangle, Clock } from "lucide-react";
import type { SiteStats } from "@/types";
import { cn } from "@/lib/utils";

export function SiteSummaryCard({ stats }: { stats: SiteStats }) {
  const { site, totalTasks, completedTasks, overdueTasks, inProgressTasks } = stats;
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const statusLines = [
    overdueTasks > 0 && { icon: AlertTriangle, text: `${overdueTasks} overdue`, color: "text-terracotta" },
    inProgressTasks > 0 && { icon: Clock, text: `${inProgressTasks} in progress`, color: "text-sky-accent" },
  ].filter(Boolean) as { icon: typeof AlertTriangle; text: string; color: string }[];

  return (
    <Link href={`/sites/${site.slug}`} className="block h-full">
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border-border/40 h-full">
        <CardContent className="p-6 h-full flex flex-col">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg font-medium text-taupe-dark leading-tight">
                {site.name}
              </h3>
              <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="size-3 shrink-0" />
                {site.location}
              </p>
            </div>

            <div className="relative flex items-center justify-center shrink-0 ml-3">
              <svg width="68" height="68" className="-rotate-90">
                <circle cx="34" cy="34" r={radius} fill="none" stroke="currentColor" className="text-ivory" strokeWidth="5" />
                <circle
                  cx="34" cy="34" r={radius} fill="none" stroke="currentColor"
                  className={cn(
                    percentage >= 75 ? "text-leaf-accent" : percentage >= 40 ? "text-sky-accent" : "text-terracotta"
                  )}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <span className="absolute text-xs font-semibold text-taupe">{percentage}%</span>
            </div>
          </div>

          <div className="mt-4 space-y-1.5 flex-1">
            {statusLines.length > 0 ? (
              statusLines.map((line, i) => (
                <p key={i} className={cn("flex items-center gap-1.5 text-xs font-medium", line.color)}>
                  <line.icon className="size-3 shrink-0" />
                  {line.text}
                </p>
              ))
            ) : (
              <p className="text-xs text-leaf-accent font-medium">All on track</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/30">
            {pendingTasks} pending of {totalTasks} total
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
