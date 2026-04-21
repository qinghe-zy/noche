import { formatDate } from "@/shared/utils/date";

export function formatArchiveHistoryDate(date: string, locale = "zh-CN"): string {
  return formatDate(date, locale === "en-US" ? "MM/DD" : "MM.DD");
}

export function formatArchiveLongDate(date: string, locale = "zh-CN"): string {
  return formatDate(date, locale === "en-US" ? "MMM DD, YYYY" : "YYYY.MM.DD");
}
