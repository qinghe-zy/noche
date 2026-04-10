export const TABLES = {
  entries: "entries",
  drafts: "drafts",
  preferences: "preferences",
} as const;

export const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.entries} (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    record_date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    saved_at TEXT,
    unlock_date TEXT,
    unlocked_at TEXT,
    destroyed_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.drafts} (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    record_date TEXT,
    slot_key TEXT NOT NULL,
    linked_entry_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_background_saved_at TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.preferences} (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
] as const;
