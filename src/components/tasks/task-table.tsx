"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusDropdown } from "./status-dropdown";
import { PriorityBadge } from "./priority-badge";
import { formatDate, formatRelativeDate, getDueUrgency } from "@/lib/format";
import { useUpdateTask } from "@/hooks/use-tasks";
import { useFilters } from "@/hooks/use-filters";
import type { Task, TaskStatus, TaskPriority, Site, Vertical } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  sites: Site[];
  verticals: Vertical[];
}

export function TaskTable({
  tasks,
  total,
  page,
  pageSize,
  sites,
  verticals,
}: TaskTableProps) {
  const updateTask = useUpdateTask();
  const { getFilter, setFilter } = useFilters();
  const sortBy = getFilter("sortBy") || "created_at";
  const sortOrder = getFilter("sortOrder") || "desc";

  const siteMap = Object.fromEntries(sites.map((s) => [s.id, s.name]));
  const verticalMap = Object.fromEntries(verticals.map((v) => [v.id, v.name]));

  const totalPages = Math.ceil(total / pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setFilter("sortOrder", sortOrder === "asc" ? "desc" : "asc");
    } else {
      setFilter("sortBy", column);
    }
  };

  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    updateTask.mutate(
      { id: taskId, status },
      { onSuccess: () => toast.success("Status updated") }
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tasks found matching your filters.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-ivory">
              <TableHead className="w-[300px]">
                <button onClick={() => handleSort("title")} className="flex items-center gap-1 hover:text-foreground text-xs uppercase tracking-wider font-semibold">
                  Task <ArrowUpDown className="size-3 opacity-40" />
                </button>
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Site</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Vertical</TableHead>
              <TableHead>
                <button onClick={() => handleSort("status")} className="flex items-center gap-1 hover:text-foreground text-xs uppercase tracking-wider font-semibold">
                  Status <ArrowUpDown className="size-3 opacity-40" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("due_date")} className="flex items-center gap-1 hover:text-foreground text-xs uppercase tracking-wider font-semibold">
                  Due <ArrowUpDown className="size-3 opacity-40" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("priority")} className="flex items-center gap-1 hover:text-foreground text-xs uppercase tracking-wider font-semibold">
                  Priority <ArrowUpDown className="size-3 opacity-40" />
                </button>
              </TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-semibold">Assigned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const urgency = getDueUrgency(task.dueDate, task.status);
              return (
                <TableRow key={task.id} className="hover:bg-ivory-light/50">
                  <TableCell>
                    <Link
                      href={`/tasks/${task.id}`}
                      className="font-medium hover:text-terracotta transition-colors"
                    >
                      {task.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">
                    {siteMap[task.siteId]?.replace("Avera ", "") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {verticalMap[task.verticalId] || "—"}
                  </TableCell>
                  <TableCell>
                    <StatusDropdown
                      status={task.status as TaskStatus}
                      onStatusChange={(s) => handleStatusChange(task.id, s)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <span
                        className={cn(
                          "text-sm",
                          urgency === "overdue" && "text-terracotta font-medium",
                          urgency === "due-soon" && "text-amber-600"
                        )}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                      {task.dueDate && urgency !== "none" && (
                        <p
                          className={cn(
                            "text-xs",
                            urgency === "overdue" && "text-terracotta",
                            urgency === "due-soon" && "text-amber-600",
                            urgency === "on-track" && "text-muted-foreground"
                          )}
                        >
                          {formatRelativeDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={task.priority as TaskPriority} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {task.assignedTo || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {tasks.map((task) => {
          const urgency = getDueUrgency(task.dueDate, task.status);
          return (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="block rounded-lg border border-border p-4 hover:bg-ivory-light/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {siteMap[task.siteId]?.replace("Avera ", "")} &middot;{" "}
                    {verticalMap[task.verticalId]}
                  </p>
                </div>
                <PriorityBadge priority={task.priority as TaskPriority} />
              </div>
              <div className="flex items-center justify-between mt-3">
                <StatusDropdown
                  status={task.status as TaskStatus}
                  onStatusChange={(s) => {
                    // Prevent navigation when clicking dropdown
                    handleStatusChange(task.id, s);
                  }}
                />
                <span
                  className={cn(
                    "text-xs",
                    urgency === "overdue" && "text-terracotta font-medium",
                    urgency === "due-soon" && "text-amber-600",
                    !urgency && "text-muted-foreground"
                  )}
                >
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of{" "}
            {total} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setFilter("page", page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setFilter("page", page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
