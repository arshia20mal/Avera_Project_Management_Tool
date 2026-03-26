import type { TaskStatus, TaskPriority, PaymentStatus } from "@/types";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  not_started: {
    label: "Not Started",
    color: "text-taupe-light",
    bgColor: "bg-taupe-light/15",
  },
  in_progress: {
    label: "In Progress",
    color: "text-sky-accent",
    bgColor: "bg-sky-accent/15",
  },
  completed: {
    label: "Completed",
    color: "text-leaf-accent",
    bgColor: "bg-leaf-accent/15",
  },
};

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; dotColor: string }
> = {
  high: {
    label: "High",
    color: "text-terracotta",
    dotColor: "bg-terracotta",
  },
  medium: {
    label: "Medium",
    color: "text-taupe",
    dotColor: "bg-taupe-light",
  },
  low: {
    label: "Low",
    color: "text-taupe-light",
    dotColor: "bg-taupe-light/50",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Pending",
    color: "text-terracotta",
    bgColor: "bg-terracotta/15",
  },
  paid: {
    label: "Paid",
    color: "text-leaf-accent",
    bgColor: "bg-leaf-accent/15",
  },
};

export const TASK_STATUSES: TaskStatus[] = [
  "not_started",
  "in_progress",
  "completed",
];

export const TASK_PRIORITIES: TaskPriority[] = ["high", "medium", "low"];

export const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid"];

export const DEFAULT_PAGE_SIZE = 20;
