import type { Entry, EntryType } from "@/domain/entry/types";
import { formatDate } from "@/shared/utils/date";
import { formatEntryTypeLabel } from "@/features/entries/entryDisplay";

export function formatMailboxTypeLabel(type: EntryType, locale = "zh-CN"): string {
  return formatEntryTypeLabel(type, locale);
}

export function formatMailboxDateLabel(entry: Entry, tab: "past" | "future", locale = "zh-CN"): string {
  if (entry.type !== "future") {
    return formatDate(entry.recordDate, "MMM DD, YYYY");
  }

  if (locale === "en-US") {
    return tab === "past"
      ? `Opened ${formatDate(entry.unlockedAt ?? entry.unlockDate ?? entry.recordDate, "MMM DD, YYYY")}`
      : `Opens ${formatDate(entry.unlockDate ?? entry.recordDate, "MMM DD, YYYY")}`;
  }

  return tab === "past"
    ? `已于 ${formatDate(entry.unlockedAt ?? entry.unlockDate ?? entry.recordDate, "YYYY.MM.DD")} 启封`
    : `将于 ${formatDate(entry.unlockDate ?? entry.recordDate, "YYYY.MM.DD")} 开启`;
}

export function formatMailboxExcerpt(entry: Entry, locale = "zh-CN"): string {
  if (entry.type === "future" && entry.status === "sealed") {
    return locale === "en-US"
      ? `This note opens on ${entry.unlockDate}.`
      : `这封信会在 ${entry.unlockDate} 当天开启。`;
  }

  return `${entry.content.slice(0, 100)}${entry.content.length > 100 ? "..." : ""}`;
}

export function formatMailboxLockedTitle(entry: Entry, locale = "zh-CN"): string {
  if (entry.type === "future" && entry.status === "sealed") {
    return locale === "en-US" ? "To Future" : "致未来";
  }

  return entry.title || "未命名";
}
