"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Check } from "lucide-react";
import { formatDate, formatRelativeDate, getDueUrgency } from "@/lib/format";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NeedsAttentionProps {
  tasks: (Task & { siteName: string; verticalName: string })[];
}

export function NeedsAttentionList({ tasks }: NeedsAttentionProps) {
  const updateTask = useUpdateTask();

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === "completed" ? "not_started" : "completed";
    updateTask.mutate(
      { id: task.id, status: newStatus },
      {
        onSuccess: () =>
          toast.success(
            newStatus === "completed" ? "Task completed" : "Task reopened"
          ),
      }
    );
  };

  if (tasks.length === 0) {
    return (
      <Card className="shadow-sm border-border/40">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-leaf-accent/10 mb-3">
            <Check className="size-6 text-leaf-accent" />
          </div>
          <p className="text-sm font-medium text-taupe-dark">You&apos;re all caught up</p>
          <p className="text-xs text-muted-foreground mt-1">
            No tasks need immediate attention across any property.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group by site for a clean visual separation
  const tasksBySite: Record<string, (Task & { siteName: string; verticalName: string })[]> = {};
  for (const task of tasks) {
    const key = task.siteName;
    if (!tasksBySite[key]) tasksBySite[key] = [];
    tasksBySite[key].push(task);
  }

  return (
    <Card className="shadow-sm border-border/40">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-medium text-taupe-dark">
            Next Steps
          </h3>
          <Link
            href="/tasks?sortBy=due_date&sortOrder=asc"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-terracotta transition-colors"
          >
            View all tasks
            <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="space-y-6">
          {Object.entries(tasksBySite).map(([siteName, siteTasks]) => (
            <div key={siteName}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {siteName.replace("Avera ", "")}
              </p>
              <div className="space-y-0.5">
                {siteTasks.map((task) => (
                  <TaskChecklistItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleComplete(task)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskChecklistItem({
  task,
  onToggle,
}: {
  task: Task & { siteName: string; verticalName: string };
  onToggle: () => void;
}) {
  const urgency = getDueUrgency(task.dueDate, task.status);
  const isCompleted = task.status === "completed";

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2.5 px-3 rounded-lg group transition-colors hover:bg-ivory-light/50",
        isCompleted && "opacity-50"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className={cn(
          "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          isCompleted
            ? "border-leaf-accent bg-leaf-accent text-white"
            : "border-taupe-light/50 hover:border-taupe-light group-hover:border-taupe"
        )}
      >
        {isCompleted && <Check className="size-3" />}
      </button>

      {/* Content */}
      <Link href={`/tasks/${task.id}`} className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm leading-snug",
            isCompleted && "line-through text-muted-foreground",
            !isCompleted && "text-taupe-dark"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {task.verticalName}
          </span>
          {task.dueDate && (
            <>
              <span className="text-muted-foreground/30">&middot;</span>
              <span
                className={cn(
                  "text-xs",
                  urgency === "overdue" && "text-terracotta font-medium",
                  urgency === "due-soon" && "text-amber-600",
                  urgency === "on-track" && "text-muted-foreground",
                  urgency === "none" && "text-muted-foreground"
                )}
              >
                {formatRelativeDate(task.dueDate)}
              </span>
            </>
          )}
        </div>
      </Link>

      {/* Assigned to — subtle, only on desktop */}
      {task.assignedTo && (
        <span className="hidden lg:block text-xs text-muted-foreground shrink-0 max-w-[100px] truncate">
          {task.assignedTo}
        </span>
      )}
    </div>
  );
}
