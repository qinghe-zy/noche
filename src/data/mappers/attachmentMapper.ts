import type { Attachment } from "@/shared/types/attachment";
import type { AttachmentRecord, ProfileAlbumItemRecord } from "@/data/repositories/attachmentRepo";
import type { EntryAlbumItem } from "@/data/repositories/entry.repository";

export function mapAttachmentToEntryRecord(attachment: Attachment): AttachmentRecord {
  return {
    id: attachment.id,
    type: attachment.type,
    entry_id: attachment.entryId,
    draft_slot_key: attachment.draftKey,
    local_uri: attachment.localUri,
    sort_order: attachment.sortOrder,
    created_at: attachment.createdAt,
    width: attachment.width ?? null,
    height: attachment.height ?? null,
  };
}

export function mapAttachmentRecordToEntryAttachment(record: AttachmentRecord): Attachment {
  return {
    id: record.id,
    type: record.type as Attachment["type"],
    entryId: record.entry_id,
    draftKey: record.draft_slot_key,
    localUri: record.local_uri,
    sortOrder: Number(record.sort_order),
    createdAt: record.created_at,
    width: record.width ?? null,
    height: record.height ?? null,
  };
}

export function mapProfileAlbumItemRecord(record: ProfileAlbumItemRecord): EntryAlbumItem {
  return {
    id: `${record.entry_id}:${record.attachment_id}`,
    entryId: record.entry_id,
    attachmentId: record.attachment_id,
    type: record.type as EntryAlbumItem["type"],
    recordDate: record.record_date,
    createdAt: record.created_at,
    localUri: record.local_uri,
    sortOrder: Number(record.sort_order),
    width: record.width ?? null,
    height: record.height ?? null,
  };
}
