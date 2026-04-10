import type { Entry } from "@/domain/entry/types";
import type { EntryRecord } from "@/data/repositories/entryRepo";

export function mapEntryToRecord(entry: Entry): EntryRecord {
  return {
    id: entry.id,
    type: entry.type,
    title: entry.title ?? '',
    content: entry.content,
    record_date: entry.recordDate,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt,
    future_unlock_date: entry.futureUnlockDate ?? null,
    future_status: entry.futureStatus ?? null,
    destroyed_at: entry.destroyedAt ?? null,
  };
}

export function mapRecordToEntry(record: EntryRecord): Entry {
  return {
    id: record.id,
    type: record.type as Entry["type"],
    title: record.title,
    content: record.content,
    recordDate: record.record_date,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    futureUnlockDate: record.future_unlock_date,
    futureStatus: record.future_status as Entry["futureStatus"],
    destroyedAt: record.destroyed_at,
  };
}
