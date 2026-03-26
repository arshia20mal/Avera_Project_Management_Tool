import type { InferSelectModel } from "drizzle-orm";
import type { sites, verticals, subSections, tasks, payments, siteVisits, taskUpdates } from "@/db/schema";

export type Site = InferSelectModel<typeof sites>;
export type Vertical = InferSelectModel<typeof verticals>;
export type SubSection = InferSelectModel<typeof subSections>;
export type Task = InferSelectModel<typeof tasks>;
export type Payment = InferSelectModel<typeof payments>;
export type SiteVisit = InferSelectModel<typeof siteVisits>;
export type TaskUpdate = InferSelectModel<typeof taskUpdates>;
export type VisitType = "planned" | "completed";

export type TaskStatus = "not_started" | "in_progress" | "completed";
export type TaskPriority = "high" | "medium" | "low";
export type PaymentStatus = "pending" | "paid";

export interface SiteStats {
  site: Site;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
}

export interface FinancialSummary {
  totalSpend: number;
  totalPending: number;
  totalPaid: number;
  spendBySite: { siteId: number; siteName: string; total: number }[];
  spendByVertical: { verticalId: number; verticalName: string; total: number }[];
  pendingPaymentsCount: number;
}

export interface DashboardData {
  siteStats: SiteStats[];
  financialSummary: FinancialSummary;
  needsAttention: (Task & { siteName: string; verticalName: string })[];
  weeklyStats: { tasksAdded: number; tasksCompleted: number };
}

export interface TaskFilters {
  siteId?: number;
  verticalId?: number;
  subSectionId?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaymentFilters {
  siteId?: number;
  verticalId?: number;
  status?: PaymentStatus;
  page?: number;
  pageSize?: number;
}
