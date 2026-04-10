import type { Entry, EntryType } from "@/domain/entry/types";
import { formatDate } from "@/shared/utils/date";

export function formatMailboxTypeLabel(type: EntryType): string {
  if (type === "jotting") {
    return "随笔";
  }

  if (type === "future") {
    return "未来信";
  }

  return "日记";
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
