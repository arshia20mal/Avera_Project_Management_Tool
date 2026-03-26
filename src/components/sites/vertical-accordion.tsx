"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StatusDropdown } from "@/components/tasks/status-dropdown";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { formatDate, getDueUrgency } from "@/lib/format";
import { useUpdateTask } from "@/hooks/use-tasks";
import type { Task, Vertical, SubSection, TaskStatus, TaskPriority } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface VerticalAccordionProps {
  verticals: Vertical[];
  subSections: SubSection[];
  tasks: Task[];
}

export function VerticalAccordion({
  verticals,
  subSections,
  tasks,
}: VerticalAccordionProps) {
  const updateTask = useUpdateTask();

  const handleStatusChange = (taskId: number, status: TaskStatus) => {
    updateTask.mutate(
      { id: taskId, status },
      { onSuccess: () => toast.success("Status updated") }
    );
  };

  return (
    <Accordion multiple className="space-y-2">
      {verticals.map((vertical) => {
        const verticalTasks = tasks.filter((t) => t.verticalId === vertical.id);
        const completedCount = verticalTasks.filter(
          (t) => t.status === "completed"
        ).length;
        const totalCount = verticalTasks.length;
        const percentage =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        const verticalSubSections = subSections.filter(
          (s) => s.verticalId === vertical.id
        );

        return (
          <AccordionItem
            key={vertical.id}
            value={String(vertical.id)}
            className="rounded-lg border border-border overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 hover:bg-ivory-light/50 [&[data-state=open]]:bg-ivory-light/30">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-1 text-left">
                  <span className="font-medium text-sm">{vertical.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {completedCount}/{totalCount} complete
                  </span>
                </div>
                {/* Progress bar */}
                <div className="hidden sm:block w-24 h-1.5 rounded-full bg-ivory">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      percentage >= 75
                        ? "bg-leaf-accent"
                        : percentage >= 40
                          ? "bg-sky-accent"
                          : "bg-terracotta"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                  {percentage}%
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-3">
              {totalCount === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No tasks in this vertical yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {verticalSubSections.map((subSection) => {
                    const ssTasks = verticalTasks.filter(
                      (t) => t.subSectionId === subSection.id
                    );
                    if (ssTasks.length === 0) return null;

                    return (
                      <div key={subSection.id}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 pl-1">
                          {subSection.name}
                        </p>
                        <div className="space-y-1">
                          {ssTasks.map((task) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              onStatusChange={handleStatusChange}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Tasks without a sub-section */}
                  {verticalTasks
                    .filter((t) => !t.subSectionId)
                    .map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function TaskRow({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
}) {
  const urgency = getDueUrgency(task.dueDate, task.status);

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-ivory-light/50 transition-colors">
      <StatusDropdown
        status={task.status as TaskStatus}
        onStatusChange={(s) => onStatusChange(task.id, s)}
      />
      <Link
        href={`/tasks/${task.id}`}
        className="flex-1 min-w-0 text-sm hover:text-terracotta transition-colors truncate"
      >
        {task.title}
      </Link>
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <PriorityBadge priority={task.priority as TaskPriority} />
        <span
          className={cn(
            "text-xs w-20 text-right",
            urgency === "overdue" && "text-terracotta font-medium",
            urgency === "due-soon" && "text-amber-600",
            urgency === "on-track" && "text-muted-foreground",
            urgency === "none" && "text-muted-foreground"
          )}
        >
          {formatDate(task.dueDate)}
        </span>
      </div>
      {task.assignedTo && (
        <span className="hidden lg:inline text-xs text-muted-foreground truncate max-w-[120px]">
          {task.assignedTo}
        </span>
      )}
    </div>
  );
}
