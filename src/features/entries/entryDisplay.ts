import type { EntryType } from "@/domain/entry/types";

export function formatEntryTypeLabel(type: EntryType, locale = "zh-CN"): string {
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

export function fallbackEntryTitle(type: EntryType, locale = "zh-CN"): string {
  if (type === "future") {
    return locale === "en-US" ? "Opened To Future" : "已开启的致未来";
  }

  return formatEntryTypeLabel(type, locale);
}
