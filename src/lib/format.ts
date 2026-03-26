import { format, formatDistanceToNow, isPast, isToday, addDays, isBefore } from "date-fns";

/**
 * Format amount in Indian Rupees with Indian numbering system (lakhs/crores)
 * e.g. 24500000 → ₹2,45,00,000
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a compact INR amount for dashboard cards
 * e.g. 2450000 → ₹24.5L, 150000000 → ₹15Cr
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount}`;
}

/**
 * Format a date string (YYYY-MM-DD) for display
 * e.g. "2026-04-15" → "15 Apr 2026"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd MMM yyyy");
}

/**
 * Format a date as relative ("2 days overdue", "in 3 days", "today")
 */
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isToday(date)) return "Today";
  if (isPast(date)) {
    return formatDistanceToNow(date, { addSuffix: false }) + " overdue";
  }
  return "in " + formatDistanceToNow(date, { addSuffix: false });
}

/**
 * Get urgency level for a due date
 */
export function getDueUrgency(
  dateStr: string | null | undefined,
  status?: string
): "overdue" | "due-soon" | "on-track" | "none" {
  if (!dateStr || status === "completed") return "none";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isPast(date) && !isToday(date)) return "overdue";
  if (isBefore(date, addDays(today, 7))) return "due-soon";
  return "on-track";
}

/**
 * Format a datetime string for display
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "dd MMM yyyy, h:mm a");
}
