import type { Entry, EntryType } from "@/domain/entry/types";
import { formatDate } from "@/shared/utils/date";

export interface ProfileIdentity {
  displayName: string;
  signature: string;
  avatarUri: string | null;
  coverUri: string | null;
  lastBackupAt: string | null;
}

export interface ProfileStats {
  recordedDays: number;
  totalWords: number;
  diaryCount: number;
}

export interface ProfileAlbumItem {
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

export interface ProfileActionItem {
  key: "privacy-lock" | "local-backup" | "about";
  title: string;
  note: string;
  value: string;
}

export const PROFILE_PREVIEW_LIMIT = 6;
export const PROFILE_APP_VERSION = "1.0.0";

export const PROFILE_PREF_KEYS = {
  displayName: "profile.displayName",
  signature: "profile.signature",
  avatarUri: "profile.avatarUri",
  coverUri: "profile.coverUri",
  lastBackupAt: "profile.lastBackupAt",
} as const;

export const PROFILE_DEFAULT_IDENTITY: ProfileIdentity = {
  displayName: "林间小径",
  signature: "安静记录时光",
  avatarUri: null,
  coverUri: null,
  lastBackupAt: null,
};

export function buildProfileAlbumItems(entries: Entry[]): ProfileAlbumItem[] {
  return entries
    .filter((entry) => (
      entry.type === "diary"
      || entry.type === "jotting"
      || (entry.type === "future" && entry.status === "unlocked")
    ))
    .flatMap((entry) =>
      (entry.attachments ?? [])
        .filter((attachment) => attachment.type === "image" && attachment.localUri.trim().length > 0)
        .sort((a, b) => a.sortOrder - b.sortOrder)
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
    .sort((a, b) => {
      if (a.recordDate !== b.recordDate) {
        return b.recordDate.localeCompare(a.recordDate);
      }

      if (a.createdAt !== b.createdAt) {
        return b.createdAt.localeCompare(a.createdAt);
      }

      return a.sortOrder - b.sortOrder;
    });
}

export function formatProfileWordCount(totalWords: number): string {
  if (totalWords >= 1000) {
    return `${(totalWords / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(totalWords);
}

export function formatProfileTypeLabel(type: EntryType): string {
  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "未来信";
  }

  return "日记";
}

export function formatProfileRecordDate(recordDate: string): string {
  return formatDate(recordDate, "YYYY.MM.DD");
}

export function formatProfileBackupLabel(lastBackupAt: string | null): string {
  if (!lastBackupAt) {
    return "尚未备份";
  }

  return `最近一次 ${formatDate(lastBackupAt, "YYYY.MM.DD HH:mm")}`;
}

export function resolveProfileInitial(displayName: string): string {
  const trimmed = displayName.trim();

  if (!trimmed) {
    return "夜";
  }

  return trimmed.slice(0, 1);
}
