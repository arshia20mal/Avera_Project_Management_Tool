import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
};

// ── Sites ────────────────────────────────────────────────────────
export const sites = sqliteTable("sites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  location: text("location").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamps.createdAt,
});

// ── Verticals ────────────────────────────────────────────────────
export const verticals = sqliteTable("verticals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

// ── Sub-sections ─────────────────────────────────────────────────
export const subSections = sqliteTable(
  "sub_sections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    verticalId: integer("vertical_id")
      .notNull()
      .references(() => verticals.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("idx_sub_sections_vertical").on(table.verticalId)]
);

// ── Tasks ────────────────────────────────────────────────────────
export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id),
    verticalId: integer("vertical_id")
      .notNull()
      .references(() => verticals.id),
    subSectionId: integer("sub_section_id").references(() => subSections.id, {
      onDelete: "set null",
    }),
    status: text("status", {
      enum: ["not_started", "in_progress", "completed"],
    })
      .notNull()
      .default("not_started"),
    priority: text("priority", { enum: ["high", "medium", "low"] })
      .notNull()
      .default("medium"),
    dueDate: text("due_date"),
    assignedTo: text("assigned_to"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("idx_tasks_site").on(table.siteId),
    index("idx_tasks_vertical").on(table.verticalId),
    index("idx_tasks_sub_section").on(table.subSectionId),
    index("idx_tasks_status").on(table.status),
    index("idx_tasks_due_date").on(table.dueDate),
    index("idx_tasks_priority").on(table.priority),
    index("idx_tasks_status_due").on(table.status, table.dueDate),
  ]
);

// ── Payments ─────────────────────────────────────────────────────
export const payments = sqliteTable(
  "payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    vendor: text("vendor").notNull(),
    amount: real("amount").notNull(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id),
    verticalId: integer("vertical_id")
      .notNull()
      .references(() => verticals.id),
    paymentDate: text("payment_date").notNull(),
    status: text("status", { enum: ["pending", "paid"] })
      .notNull()
      .default("pending"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("idx_payments_site").on(table.siteId),
    index("idx_payments_vertical").on(table.verticalId),
    index("idx_payments_status").on(table.status),
  ]
);

// ── Site Visits ──────────────────────────────────────────────────
export const siteVisits = sqliteTable(
  "site_visits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id),
    visitDate: text("visit_date").notNull(),
    visitType: text("visit_type", { enum: ["planned", "completed"] })
      .notNull()
      .default("planned"),
    purpose: text("purpose"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("idx_site_visits_site").on(table.siteId),
    index("idx_site_visits_date").on(table.visitDate),
  ]
);

// ── Task Updates ────────────────────────────────────────────────
export const taskUpdates = sqliteTable(
  "task_updates",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("idx_task_updates_task").on(table.taskId)]
);

// ── App metadata ─────────────────────────────────────────────────
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
