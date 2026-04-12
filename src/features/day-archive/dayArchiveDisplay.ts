function splitDateParts(date: string): [string, string, string] {
  const [year = "", month = "", day = ""] = date.split("-");
  return [year, month, day];
}

export function formatDayArchiveTitle(recordDate: string, locale = "zh-CN"): string {
  if (locale === "en-US") {
    return recordDate;
  }
  const [year, month, day] = splitDateParts(recordDate);
  return `${year}年${month}月${day}日`;
}

export function formatDayArchiveSubtitle(count: number, locale = "zh-CN"): string {
  return locale === "en-US"
    ? `${count} readable pages from this day`
    : `这一天收着 ${count} 封可阅读记录`;
}

export function formatDayArchiveEmptyText(recordDate: string, locale = "zh-CN"): string {
  return locale === "en-US"
    ? `There are no readable pages for ${formatDayArchiveTitle(recordDate, locale)} yet.`
    : `${formatDayArchiveTitle(recordDate, locale)}还没有可阅读的记录。`;
}
