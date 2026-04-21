export const TABLES = {
  entries: "entries",
  drafts: "drafts",
  preferences: "preferences",
  attachments: "attachments",
  profileStatsCache: "profile_stats_cache",
  recordDateCounters: "record_date_counters",
  archiveQuestions: "archive_questions",
  archiveEntries: "archive_entries",
} as const;

export const SQLITE_DB_NAME = "noche";
export const SQLITE_DB_PATH = "_doc/noche.db";
export const LATEST_DB_VERSION = 4;

export const BASE_SCHEMA_STATEMENTS = [
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
    diary_prelude_status TEXT NOT NULL DEFAULT 'skipped',
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
    diary_prelude_status TEXT NOT NULL DEFAULT 'skipped',
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

export const ATTACHMENT_AND_STATS_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.attachments} (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    entry_id TEXT,
    draft_slot_key TEXT,
    local_uri TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    CHECK (
      (entry_id IS NOT NULL AND draft_slot_key IS NULL)
      OR (entry_id IS NULL AND draft_slot_key IS NOT NULL)
    )
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.profileStatsCache} (
    cache_key TEXT PRIMARY KEY,
    recorded_days INTEGER NOT NULL DEFAULT 0,
    total_words INTEGER NOT NULL DEFAULT 0,
    diary_count INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.recordDateCounters} (
    record_date TEXT PRIMARY KEY,
    active_count INTEGER NOT NULL DEFAULT 0
  );`,
  `CREATE INDEX IF NOT EXISTS idx_entries_active_timeline
    ON ${TABLES.entries}(destroyed_at, record_date DESC, created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_type_status_unlock
    ON ${TABLES.entries}(destroyed_at, type, status, unlock_date ASC);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_calendar_preview
    ON ${TABLES.entries}(destroyed_at, type, record_date, saved_at DESC, created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_entries_future_preview
    ON ${TABLES.entries}(destroyed_at, type, unlock_date, saved_at DESC, created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_attachments_entry_owner
    ON ${TABLES.attachments}(entry_id, sort_order);`,
  `CREATE INDEX IF NOT EXISTS idx_attachments_draft_owner
    ON ${TABLES.attachments}(draft_slot_key, sort_order);`,
] as const;

export const ARCHIVE_SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS ${TABLES.archiveQuestions} (
    date TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS ${TABLES.archiveEntries} (
    date TEXT PRIMARY KEY,
    id TEXT NOT NULL UNIQUE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    question_source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    answered_at TEXT
  );`,
  `CREATE INDEX IF NOT EXISTS idx_archive_entries_date
    ON ${TABLES.archiveEntries}(date DESC);`,
] as const;

export const ALL_SCHEMA_STATEMENTS = [
  ...BASE_SCHEMA_STATEMENTS,
  ...ATTACHMENT_AND_STATS_SCHEMA_STATEMENTS,
  ...ARCHIVE_SCHEMA_STATEMENTS,
] as const;
