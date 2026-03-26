"use client";

import { Suspense } from "react";
import { TaskFilters } from "./task-filters";
import { TaskTable } from "./task-table";
import { useTasks } from "@/hooks/use-tasks";
import { useFilters } from "@/hooks/use-filters";
import type { Site, Vertical, SubSection } from "@/types";
import type { TaskFilters as TaskFiltersType } from "@/types";

interface TaskListContentProps {
  sites: Site[];
  verticals: (Vertical & { subSections: SubSection[] })[];
}

export function TaskListContent({ sites, verticals }: TaskListContentProps) {
  const { getFilter, getNumberFilter } = useFilters();

  const filters: TaskFiltersType = {
    siteId: getNumberFilter("siteId"),
    verticalId: getNumberFilter("verticalId"),
    subSectionId: getNumberFilter("subSectionId"),
    status: getFilter("status") as TaskFiltersType["status"],
    priority: getFilter("priority") as TaskFiltersType["priority"],
    search: getFilter("search"),
    page: getNumberFilter("page") || 1,
    sortBy: getFilter("sortBy"),
    sortOrder: getFilter("sortOrder") as "asc" | "desc" | undefined,
  };

  const { data, isLoading } = useTasks(filters);

  return (
    <div className="space-y-4">
      <TaskFilters sites={sites} verticals={verticals} />

      {isLoading || !data ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-ivory-light animate-pulse" />
          ))}
        </div>
      ) : (
        <TaskTable
          tasks={data.items}
          total={data.total}
          page={data.page}
          pageSize={data.pageSize}
          sites={sites}
          verticals={verticals}
        />
      )}
    </div>
  );
}
