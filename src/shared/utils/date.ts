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
