import type { Entry, EntryType } from "@/domain/entry/types";
import {
  buildEntryAlbumItems,
  type EntryAlbumItem,
} from "@/domain/services/entryAlbumService";
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

export type ProfileAlbumItem = EntryAlbumItem;

export interface ProfileActionItem {
  key: "appearance-settings" | "local-backup" | "about";
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

export function createProfileDefaultIdentity(locale = "zh-CN"): ProfileIdentity {
  return {
    displayName: "",
    signature: "",
    avatarUri: null,
    coverUri: null,
    lastBackupAt: null,
  };
}

export function buildProfileAlbumItems(entries: Entry[]): ProfileAlbumItem[] {
  return buildEntryAlbumItems(entries);
}

export function formatProfileWordCount(totalWords: number): string {
  if (totalWords >= 1000) {
    return `${(totalWords / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(totalWords);
}

export function formatProfileTypeLabel(type: EntryType, locale = "zh-CN"): string {
  if (locale === "en-US") {
    if (type === "jotting") {
      return "Jotting";
    }

    if (type === "future") {
      return "To Future";
    }

    return "Diary";
  }

  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "致未来";
  }

  return "日记";
}

export function formatProfileRecordDate(recordDate: string): string {
  return formatDate(recordDate, "YYYY.MM.DD");
}

export function formatProfileBackupLabel(lastBackupAt: string | null, locale = "zh-CN"): string {
  if (!lastBackupAt) {
    return locale === "en-US" ? "No backup yet" : "尚未备份";
  }

  return locale === "en-US"
    ? `Last backup ${formatDate(lastBackupAt, "YYYY.MM.DD HH:mm")}`
    : `最近一次 ${formatDate(lastBackupAt, "YYYY.MM.DD HH:mm")}`;
}

export function formatProfileThemeLabel(theme: "system" | "light" | "dark", locale = "zh-CN"): string {
  if (locale === "en-US") {
    if (theme === "light") {
      return "Light";
    }

    if (theme === "dark") {
      return "Dark";
    }

    return "System";
  }

  if (theme === "light") {
    return "浅色";
  }

  if (theme === "dark") {
    return "深色";
  }

  return "跟随系统";
}

export function formatProfileLocaleLabel(locale: string): string {
  if (locale === "en-US") {
    return "English";
  }

  return "中文";
}

export function formatProfileWeekStartLabel(weekStartsOn: 0 | 1, locale = "zh-CN"): string {
  if (locale === "en-US") {
    return weekStartsOn === 0 ? "Sunday first" : "Monday first";
  }

  return weekStartsOn === 0 ? "周日开始" : "周一开始";
}

export function formatProfileAppearanceLabel(
  theme: "system" | "light" | "dark",
  locale: string,
  weekStartsOn: 0 | 1,
): string {
  return `${formatProfileThemeLabel(theme, locale)} · ${formatProfileWeekStartLabel(weekStartsOn, locale)} · ${formatProfileLocaleLabel(locale)}`;
}

export function resolveProfileInitial(displayName: string, locale = "zh-CN"): string {
  const trimmed = displayName.trim();

  if (!trimmed) {
    return "";
  }

  return trimmed.slice(0, 1);
}
