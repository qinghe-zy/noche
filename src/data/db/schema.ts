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
    destroyed_at TEXT,
    attachments_json TEXT NOT NULL DEFAULT '[]',
    diary_prelude_json TEXT NOT NULL DEFAULT 'null'
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.drafts} (
    slot_key TEXT PRIMARY KEY,
    id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    record_date TEXT,
    linked_entry_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_background_saved_at TEXT,
    unlock_date TEXT,
    attachments_json TEXT NOT NULL DEFAULT '[]',
    diary_prelude_json TEXT NOT NULL DEFAULT 'null'
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.preferences} (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_entries_record_date ON ${TABLES.entries}(record_date DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_type ON ${TABLES.entries}(type);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_status ON ${TABLES.entries}(status);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_unlock_date ON ${TABLES.entries}(unlock_date);`,
] as const;
