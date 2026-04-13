import type { EntryType, Entry } from "@/domain/entry/types";
import type { Attachment } from "@/shared/types/attachment";

export interface EntryAlbumItem {
  id: string;
  entryId: string;
  attachmentId: string;
  type: EntryType;
  recordDate: string;
  createdAt: string;
  localUri: string;
  sortOrder: number;
  width: number | null;
  height: number | null;
}

function isVisibleAlbumEntry(entry: Entry): boolean {
  return (
    entry.type === "diary"
    || entry.type === "jotting"
    || (entry.type === "future" && entry.status === "unlocked")
  );
}

function isVisibleImageAttachment(attachment: Attachment): boolean {
  return attachment.type === "image" && attachment.localUri.trim().length > 0;
}

export function buildEntryAlbumItems(entries: Entry[]): EntryAlbumItem[] {
  return entries
    .filter(isVisibleAlbumEntry)
    .flatMap((entry) =>
      (entry.attachments ?? [])
        .filter(isVisibleImageAttachment)
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((attachment) => ({
          id: `${entry.id}:${attachment.id}`,
          entryId: entry.id,
          attachmentId: attachment.id,
          type: entry.type,
          recordDate: entry.recordDate,
          createdAt: entry.createdAt,
          localUri: attachment.localUri,
          sortOrder: attachment.sortOrder,
          width: attachment.width ?? null,
          height: attachment.height ?? null,
        })),
    )
    .sort((left, right) => {
      if (left.recordDate !== right.recordDate) {
        return right.recordDate.localeCompare(left.recordDate);
      }

      if (left.createdAt !== right.createdAt) {
        return right.createdAt.localeCompare(left.createdAt);
      }

      return left.sortOrder - right.sortOrder;
    });
}
