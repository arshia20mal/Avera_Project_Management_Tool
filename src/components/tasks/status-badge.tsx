import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG } from "@/lib/constants";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium text-xs",
        config.bgColor,
        config.color,
        "hover:opacity-80"
      )}
    >
      {config.label}
    </Badge>
  );
}
