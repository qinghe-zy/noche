function splitDateParts(date: string): [string, string, string] {
  const [year = "", month = "", day = ""] = date.split("-");
  return [year, month, day];
}

export function formatDayArchiveTitle(recordDate: string): string {
  const [year, month, day] = splitDateParts(recordDate);
  return `${year}年${month}月${day}日`;
}

export function formatDayArchiveSubtitle(count: number): string {
  return `这一天收着 ${count} 封可阅读记录`;
}

export function formatDayArchiveEmptyText(recordDate: string): string {
  return `${formatDayArchiveTitle(recordDate)}还没有可阅读的记录。`;
}
