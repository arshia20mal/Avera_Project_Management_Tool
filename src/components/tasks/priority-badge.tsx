import { PRIORITY_CONFIG } from "@/lib/constants";
import type { TaskPriority } from "@/types";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", config.color)}>
      <span className={cn("size-2 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
