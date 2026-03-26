"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "./status-badge";
import { STATUS_CONFIG, TASK_STATUSES } from "@/lib/constants";
import type { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusDropdownProps {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
}

export function StatusDropdown({ status, onStatusChange }: StatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <StatusBadge status={status} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {TASK_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => onStatusChange(s)}
            className={cn(s === status && "bg-accent")}
          >
            <span
              className={cn(
                "size-2 rounded-full mr-2",
                s === "not_started" && "bg-taupe-light",
                s === "in_progress" && "bg-sky-accent",
                s === "completed" && "bg-leaf-accent"
              )}
            />
            {STATUS_CONFIG[s].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
