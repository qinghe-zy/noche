const MONTH_LABELS = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
] as const;

function splitDateParts(date: string): [string, number] {
  const [year = "", month = "1"] = date.split("-");
  return [year, Number.parseInt(month, 10)];
}

export function formatCalendarMonthLabel(date: string): string {
  const [, month] = splitDateParts(date);
  return MONTH_LABELS[month - 1] ?? "";
}

export function formatCalendarYearLabel(date: string): string {
  const [year] = splitDateParts(date);
  return year;
}

export function formatCalendarGuideText(selectedDate: string | null, hasRecord: boolean): string {
  if (!selectedDate) {
    return "选一个日期，查看已有记录或补写一篇日记。";
  }

  if (hasRecord) {
    return `${selectedDate} 这一天已有记录，可继续阅读或查看当天归档。`;
  }

  return `${selectedDate} 这一天还没有记录，可以补写一篇日记。`;
}
