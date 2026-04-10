import type { EntryType } from "@/domain/entry/types";

export function formatEntryTypeLabel(type: EntryType): string {
  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "未来信";
  }

  return "日记";
}

export function fallbackEntryTitle(type: EntryType): string {
  if (type === "future") {
    return "已开启的未来信";
  }

  return formatEntryTypeLabel(type);
}
