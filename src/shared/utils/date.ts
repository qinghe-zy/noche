import dayjs, { type ConfigType } from "dayjs";

export function formatDate(source: ConfigType, format = "YYYY-MM-DD"): string {
  return dayjs(source).format(format);
}

export function nowIso(): string {
  return dayjs().toISOString();
}

export function tomorrowDate(): string {
  return dayjs().add(1, "day").format("YYYY-MM-DD");
}

export function getDaysInMonth(date: ConfigType): number {
  return dayjs(date).daysInMonth();
}

export function getFirstDayOfWeek(date: ConfigType, weekStartsOn: 0 | 1 = 0): number {
  const weekday = dayjs(date).startOf("month").day();
  return (weekday - weekStartsOn + 7) % 7;
}

export function addMonth(date: ConfigType, value: number): string {
  return dayjs(date).add(value, "month").format("YYYY-MM-DD");
}

export function isSameDay(date1: ConfigType, date2: ConfigType): boolean {
  return dayjs(date1).isSame(dayjs(date2), "day");
}
