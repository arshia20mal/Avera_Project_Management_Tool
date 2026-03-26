import { db } from "@/db";
import {
  sites,
  verticals,
  subSections,
  tasks,
  payments,
  siteVisits,
  taskUpdates,
} from "@/db/schema";
import {
  eq,
  and,
  sql,
  asc,
  desc,
  lte,
  gte,
  ne,
  like,
  count,
  sum,
} from "drizzle-orm";
import type {
  TaskFilters,
  PaymentFilters,
  DashboardData,
  SiteStats,
  FinancialSummary,
} from "@/types";
import { DEFAULT_PAGE_SIZE } from "./constants";

// ── Sites ────────────────────────────────────────────────────────

export function getAllSites() {
  return db.select().from(sites).orderBy(asc(sites.sortOrder)).all();
}

export function getSiteBySlug(slug: string) {
  return db.select().from(sites).where(eq(sites.slug, slug)).get();
}

// ── Verticals ────────────────────────────────────────────────────

export function getAllVerticals() {
  return db.select().from(verticals).orderBy(asc(verticals.sortOrder)).all();
}

export function getVerticalsWithSubSections() {
  const allVerticals = db
    .select()
    .from(verticals)
    .orderBy(asc(verticals.sortOrder))
    .all();
  const allSubSections = db
    .select()
    .from(subSections)
    .orderBy(asc(subSections.sortOrder))
    .all();

  return allVerticals.map((v) => ({
    ...v,
    subSections: allSubSections.filter((s) => s.verticalId === v.id),
  }));
}

export function createVertical(name: string, sortOrder: number) {
  return db
    .insert(verticals)
    .values({ name, sortOrder })
    .returning()
    .get();
}

export function updateVertical(
  id: number,
  data: { name?: string; sortOrder?: number }
) {
  return db
    .update(verticals)
    .set({ ...data, updatedAt: sql`datetime('now')` })
    .where(eq(verticals.id, id))
    .returning()
    .get();
}

export function deleteVertical(id: number) {
  // Cascade: sub-sections auto-deleted, tasks have sub_section_id set to null
  // Also delete tasks that belong to this vertical
  db.delete(tasks).where(eq(tasks.verticalId, id)).run();
  db.delete(payments).where(eq(payments.verticalId, id)).run();
  return db.delete(verticals).where(eq(verticals.id, id)).run();
}

// ── Sub-sections ─────────────────────────────────────────────────

export function getSubSectionsByVertical(verticalId: number) {
  return db
    .select()
    .from(subSections)
    .where(eq(subSections.verticalId, verticalId))
    .orderBy(asc(subSections.sortOrder))
    .all();
}

export function getAllSubSections() {
  return db
    .select()
    .from(subSections)
    .orderBy(asc(subSections.sortOrder))
    .all();
}

export function createSubSection(
  verticalId: number,
  name: string,
  sortOrder: number
) {
  return db
    .insert(subSections)
    .values({ verticalId, name, sortOrder })
    .returning()
    .get();
}

export function updateSubSection(
  id: number,
  data: { name?: string; sortOrder?: number }
) {
  return db
    .update(subSections)
    .set({ ...data, updatedAt: sql`datetime('now')` })
    .where(eq(subSections.id, id))
    .returning()
    .get();
}

export function deleteSubSection(id: number) {
  return db.delete(subSections).where(eq(subSections.id, id)).run();
}

// ── Tasks ────────────────────────────────────────────────────────

export function getTasksFiltered(filters: TaskFilters) {
  const {
    siteId,
    verticalId,
    subSectionId,
    status,
    priority,
    dueDateFrom,
    dueDateTo,
    search,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    sortBy = "created_at",
    sortOrder = "desc",
  } = filters;

  const conditions = [];
  if (siteId) conditions.push(eq(tasks.siteId, siteId));
  if (verticalId) conditions.push(eq(tasks.verticalId, verticalId));
  if (subSectionId) conditions.push(eq(tasks.subSectionId, subSectionId));
  if (status) conditions.push(eq(tasks.status, status));
  if (priority) conditions.push(eq(tasks.priority, priority));
  if (dueDateFrom) conditions.push(gte(tasks.dueDate, dueDateFrom));
  if (dueDateTo) conditions.push(lte(tasks.dueDate, dueDateTo));
  if (search) conditions.push(like(tasks.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumn = {
    title: tasks.title,
    site_id: tasks.siteId,
    vertical_id: tasks.verticalId,
    status: tasks.status,
    priority: tasks.priority,
    due_date: tasks.dueDate,
    created_at: tasks.createdAt,
  }[sortBy] || tasks.createdAt;

  const orderFn = sortOrder === "asc" ? asc : desc;

  const items = db
    .select()
    .from(tasks)
    .where(where)
    .orderBy(orderFn(sortColumn))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  const [{ total }] = db
    .select({ total: count() })
    .from(tasks)
    .where(where)
    .all();

  return { items, total, page, pageSize };
}

export function getTaskById(id: number) {
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
}

export function createTask(data: {
  title: string;
  siteId: number;
  verticalId: number;
  subSectionId?: number | null;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  assignedTo?: string | null;
  notes?: string | null;
}) {
  return db
    .insert(tasks)
    .values({
      title: data.title,
      siteId: data.siteId,
      verticalId: data.verticalId,
      subSectionId: data.subSectionId ?? null,
      status: (data.status as "not_started" | "in_progress" | "completed") ?? "not_started",
      priority: (data.priority as "high" | "medium" | "low") ?? "medium",
      dueDate: data.dueDate ?? null,
      assignedTo: data.assignedTo ?? null,
      notes: data.notes ?? null,
    })
    .returning()
    .get();
}

export function updateTask(
  id: number,
  data: {
    title?: string;
    siteId?: number;
    verticalId?: number;
    subSectionId?: number | null;
    status?: string;
    priority?: string;
    dueDate?: string | null;
    assignedTo?: string | null;
    notes?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {
    updatedAt: sql`datetime('now')`,
  };
  if (data.title !== undefined) updateData.title = data.title;
  if (data.siteId !== undefined) updateData.siteId = data.siteId;
  if (data.verticalId !== undefined) updateData.verticalId = data.verticalId;
  if (data.subSectionId !== undefined) updateData.subSectionId = data.subSectionId;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.notes !== undefined) updateData.notes = data.notes;

  return db
    .update(tasks)
    .set(updateData)
    .where(eq(tasks.id, id))
    .returning()
    .get();
}

export function deleteTask(id: number) {
  return db.delete(tasks).where(eq(tasks.id, id)).run();
}

export function getTasksBySite(siteId: number) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.siteId, siteId))
    .orderBy(asc(tasks.verticalId), asc(tasks.subSectionId))
    .all();
}

// ── Payments ─────────────────────────────────────────────────────

export function getPaymentsFiltered(filters: PaymentFilters) {
  const {
    siteId,
    verticalId,
    status,
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filters;

  const conditions = [];
  if (siteId) conditions.push(eq(payments.siteId, siteId));
  if (verticalId) conditions.push(eq(payments.verticalId, verticalId));
  if (status) conditions.push(eq(payments.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = db
    .select()
    .from(payments)
    .where(where)
    .orderBy(desc(payments.paymentDate))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  const [{ total }] = db
    .select({ total: count() })
    .from(payments)
    .where(where)
    .all();

  return { items, total, page, pageSize };
}

export function getPaymentById(id: number) {
  return db.select().from(payments).where(eq(payments.id, id)).get();
}

export function createPayment(data: {
  vendor: string;
  amount: number;
  siteId: number;
  verticalId: number;
  paymentDate: string;
  status?: string;
  notes?: string | null;
}) {
  return db
    .insert(payments)
    .values({
      vendor: data.vendor,
      amount: data.amount,
      siteId: data.siteId,
      verticalId: data.verticalId,
      paymentDate: data.paymentDate,
      status: (data.status as "pending" | "paid") ?? "pending",
      notes: data.notes ?? null,
    })
    .returning()
    .get();
}

export function updatePayment(
  id: number,
  data: {
    vendor?: string;
    amount?: number;
    siteId?: number;
    verticalId?: number;
    paymentDate?: string;
    status?: string;
    notes?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {
    updatedAt: sql`datetime('now')`,
  };
  if (data.vendor !== undefined) updateData.vendor = data.vendor;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.siteId !== undefined) updateData.siteId = data.siteId;
  if (data.verticalId !== undefined) updateData.verticalId = data.verticalId;
  if (data.paymentDate !== undefined) updateData.paymentDate = data.paymentDate;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  return db
    .update(payments)
    .set(updateData)
    .where(eq(payments.id, id))
    .returning()
    .get();
}

export function deletePayment(id: number) {
  return db.delete(payments).where(eq(payments.id, id)).run();
}

// ── Weekly Stats ────────────────────────────────────────────────

export function getWeeklyStats() {
  // Calculate start of current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const weekStart = monday.toISOString().replace("T", " ").slice(0, 19);

  const [{ tasksAdded }] = db
    .select({ tasksAdded: count() })
    .from(tasks)
    .where(gte(tasks.createdAt, weekStart))
    .all();

  const [{ tasksCompleted }] = db
    .select({ tasksCompleted: count() })
    .from(tasks)
    .where(
      and(
        eq(tasks.status, "completed"),
        gte(tasks.updatedAt, weekStart)
      )
    )
    .all();

  return { tasksAdded, tasksCompleted };
}

// ── Task Updates ────────────────────────────────────────────────

export function getTaskUpdates(taskId: number) {
  return db
    .select()
    .from(taskUpdates)
    .where(eq(taskUpdates.taskId, taskId))
    .orderBy(desc(taskUpdates.createdAt))
    .all();
}

export function createTaskUpdate(taskId: number, content: string) {
  return db
    .insert(taskUpdates)
    .values({ taskId, content })
    .returning()
    .get();
}

// ── Dashboard ────────────────────────────────────────────────────

export function getDashboardData(): DashboardData {
  const allSites = getAllSites();
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Site stats
  const siteStats: SiteStats[] = allSites.map((site) => {
    const siteTasks = db
      .select()
      .from(tasks)
      .where(eq(tasks.siteId, site.id))
      .all();

    const totalTasks = siteTasks.length;
    const completedTasks = siteTasks.filter(
      (t) => t.status === "completed"
    ).length;
    const overdueTasks = siteTasks.filter(
      (t) =>
        t.dueDate &&
        t.dueDate < today &&
        t.status !== "completed"
    ).length;
    const inProgressTasks = siteTasks.filter(
      (t) => t.status === "in_progress"
    ).length;
    return {
      site,
      totalTasks,
      completedTasks,
      overdueTasks,
      inProgressTasks,
    };
  });

  // Financial summary
  const allPayments = db.select().from(payments).all();
  const totalSpend = allPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = allPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = totalSpend;

  const spendBySite = allSites.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    total: allPayments
      .filter((p) => p.siteId === site.id && p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0),
  }));

  const allVerticals = getAllVerticals();
  const spendByVertical = allVerticals
    .map((v) => ({
      verticalId: v.id,
      verticalName: v.name,
      total: allPayments
        .filter((p) => p.verticalId === v.id && p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    }))
    .filter((v) => v.total > 0);

  const pendingPaymentsCount = allPayments.filter(
    (p) => p.status === "pending"
  ).length;

  const financialSummary: FinancialSummary = {
    totalSpend,
    totalPending,
    totalPaid,
    spendBySite,
    spendByVertical,
    pendingPaymentsCount,
  };

  // Needs attention: overdue or due within 7 days, not completed
  const allSiteMap = Object.fromEntries(allSites.map((s) => [s.id, s.name]));
  const allVerticalMap = Object.fromEntries(
    allVerticals.map((v) => [v.id, v.name])
  );

  const needsAttention = db
    .select()
    .from(tasks)
    .where(
      and(
        ne(tasks.status, "completed"),
        lte(tasks.dueDate, sevenDaysFromNow)
      )
    )
    .orderBy(asc(tasks.dueDate))
    .limit(25)
    .all()
    .map((t) => ({
      ...t,
      siteName: allSiteMap[t.siteId] || "",
      verticalName: allVerticalMap[t.verticalId] || "",
    }));

  const weeklyStats = getWeeklyStats();

  return { siteStats, financialSummary, needsAttention, weeklyStats };
}

// ── Counts (for settings delete warnings) ────────────────────────

export function getTaskCountByVertical(verticalId: number) {
  const [result] = db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.verticalId, verticalId))
    .all();
  return result.count;
}

export function getTaskCountBySubSection(subSectionId: number) {
  const [result] = db
    .select({ count: count() })
    .from(tasks)
    .where(eq(tasks.subSectionId, subSectionId))
    .all();
  return result.count;
}

// ── Site Visits ──────────────────────────────────────────────────

export function getSiteVisits(month?: string) {
  if (month) {
    // month format: "2026-03"
    return db
      .select()
      .from(siteVisits)
      .where(like(siteVisits.visitDate, `${month}%`))
      .orderBy(asc(siteVisits.visitDate))
      .all();
  }
  return db
    .select()
    .from(siteVisits)
    .orderBy(desc(siteVisits.visitDate))
    .all();
}

export function createSiteVisit(data: {
  siteId: number;
  visitDate: string;
  visitType?: string;
  purpose?: string | null;
  notes?: string | null;
}) {
  return db
    .insert(siteVisits)
    .values({
      siteId: data.siteId,
      visitDate: data.visitDate,
      visitType: (data.visitType as "planned" | "completed") ?? "planned",
      purpose: data.purpose ?? null,
      notes: data.notes ?? null,
    })
    .returning()
    .get();
}

export function updateSiteVisit(
  id: number,
  data: {
    siteId?: number;
    visitDate?: string;
    visitType?: string;
    purpose?: string | null;
    notes?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {
    updatedAt: sql`datetime('now')`,
  };
  if (data.siteId !== undefined) updateData.siteId = data.siteId;
  if (data.visitDate !== undefined) updateData.visitDate = data.visitDate;
  if (data.visitType !== undefined) updateData.visitType = data.visitType;
  if (data.purpose !== undefined) updateData.purpose = data.purpose;
  if (data.notes !== undefined) updateData.notes = data.notes;

  return db
    .update(siteVisits)
    .set(updateData)
    .where(eq(siteVisits.id, id))
    .returning()
    .get();
}

export function deleteSiteVisit(id: number) {
  return db.delete(siteVisits).where(eq(siteVisits.id, id)).run();
}
