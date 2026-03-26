import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { seedDatabase } from "./seed";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "avera.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS verticals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sub_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vertical_id INTEGER NOT NULL REFERENCES verticals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_sub_sections_vertical ON sub_sections(vertical_id);

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    vertical_id INTEGER NOT NULL REFERENCES verticals(id),
    sub_section_id INTEGER REFERENCES sub_sections(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK(status IN ('not_started','in_progress','completed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high','medium','low')),
    due_date TEXT,
    assigned_to TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_tasks_site ON tasks(site_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_vertical ON tasks(vertical_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_sub_section ON tasks(sub_section_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
  CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
  CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON tasks(status, due_date);

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor TEXT NOT NULL,
    amount REAL NOT NULL,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    vertical_id INTEGER NOT NULL REFERENCES verticals(id),
    payment_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_payments_site ON payments(site_id);
  CREATE INDEX IF NOT EXISTS idx_payments_vertical ON payments(vertical_id);
  CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

  CREATE TABLE IF NOT EXISTS site_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL REFERENCES sites(id),
    visit_date TEXT NOT NULL,
    visit_type TEXT NOT NULL DEFAULT 'planned' CHECK(visit_type IN ('planned','completed')),
    purpose TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_site_visits_site ON site_visits(site_id);
  CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);

  CREATE TABLE IF NOT EXISTS task_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_task_updates_task ON task_updates(task_id);
`);

// Seed default data on first run
seedDatabase(db as ReturnType<typeof drizzle>);
