import type { Entry, EntryType } from "@/domain/entry/types";
import { formatDate } from "@/shared/utils/date";
import { formatEntryTypeLabel } from "@/features/entries/entryDisplay";

export function formatMailboxTypeLabel(type: EntryType): string {
  return formatEntryTypeLabel(type);
}

export function formatMailboxDateLabel(entry: Entry, tab: "past" | "future"): string {
  if (entry.type !== "future") {
    return formatDate(entry.recordDate, "MMM DD, YYYY");
  }

  return tab === "past"
    ? `启封于 ${formatDate(entry.recordDate, "MMM DD, YYYY")}`
    : `将于 ${entry.unlockDate} 开启`;
}

export function formatMailboxExcerpt(entry: Entry): string {
  if (entry.type === "future" && entry.status === "sealed") {
    return `这封未来信会在 ${entry.unlockDate} 当天开启。`;
  }

  return `${entry.content.slice(0, 100)}${entry.content.length > 100 ? "..." : ""}`;
}

export function formatMailboxLockedTitle(entry: Entry): string {
  if (entry.type === "future" && entry.status === "sealed") {
    return "写给未来的信";
  }

  return entry.title || "未命名";
}
