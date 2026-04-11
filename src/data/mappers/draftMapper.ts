import type { Draft } from "@/domain/draft/types";
import type { DraftRecord } from "@/data/repositories/draftRepo";

export function mapDraftToRecord(draft: Draft): DraftRecord {
  return {
    id: draft.id,
    type: draft.type,
    title: draft.title,
    content: draft.content,
    record_date: draft.recordDate,
    slot_key: draft.slotKey,
    linked_entry_id: draft.linkedEntryId ?? null,
    created_at: draft.createdAt,
    updated_at: draft.updatedAt,
    last_background_saved_at: draft.lastBackgroundSavedAt ?? null,
    unlock_date: draft.unlockDate ?? null,
    attachments_json: JSON.stringify(draft.attachments ?? []),
    diary_prelude_json: JSON.stringify(draft.diaryPrelude ?? null),
  };
}

export function mapRecordToDraft(record: DraftRecord): Draft {
  return {
    id: record.id,
    type: record.type as Draft["type"],
    title: record.title,
    content: record.content,
    recordDate: record.record_date,
    slotKey: record.slot_key,
    linkedEntryId: record.linked_entry_id,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastBackgroundSavedAt: record.last_background_saved_at,
    unlockDate: record.unlock_date,
    attachments: record.attachments_json ? JSON.parse(record.attachments_json) : [],
    diaryPrelude: record.diary_prelude_json ? JSON.parse(record.diary_prelude_json) : null,
  };
}
