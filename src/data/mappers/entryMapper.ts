import type { Entry } from "@/domain/entry/types";
import type { EntryRecord } from "@/data/repositories/entryRepo";
import { cloneDiaryPrelude, normalizeDiaryPreludeStatus } from "@/domain/diaryPrelude/catalog";

export function mapEntryToRecord(entry: Entry): EntryRecord {
  return {
    id: entry.id,
    type: entry.type,
    status: entry.status,
    title: entry.title,
    content: entry.content,
    record_date: entry.recordDate,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    saved_at: entry.savedAt,
    unlock_date: entry.unlockDate,
    unlocked_at: entry.unlockedAt,
    destroyed_at: entry.destroyedAt ?? null,
    attachments_json: JSON.stringify(entry.attachments ?? []),
    diary_prelude_status: entry.diaryPreludeStatus,
    diary_prelude_json: JSON.stringify(entry.diaryPrelude ?? null),
  };
}

export function mapRecordToEntry(record: EntryRecord): Entry {
  const diaryPrelude = cloneDiaryPrelude(record.diary_prelude_json ? JSON.parse(record.diary_prelude_json) : null);

  return {
    id: record.id,
    type: record.type as Entry["type"],
    status: record.status as Entry["status"],
    title: record.title,
    content: record.content,
    recordDate: record.record_date,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    savedAt: record.saved_at,
    unlockDate: record.unlock_date,
    unlockedAt: record.unlocked_at,
    destroyedAt: record.destroyed_at,
    attachments: record.attachments_json ? JSON.parse(record.attachments_json) : [],
    diaryPreludeStatus: (record.type as Entry["type"]) === "diary"
      ? normalizeDiaryPreludeStatus(record.diary_prelude_status, {
          isNewDiaryDraft: false,
          prelude: diaryPrelude,
        })
      : "skipped",
    diaryPrelude,
  };
}
