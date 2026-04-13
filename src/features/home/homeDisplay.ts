import dayjs from "dayjs";

const WEEKDAY_LABELS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"] as const;

export function formatHomeDateInfo(source: string | Date = new Date()): string {
  const date = dayjs(source);
  return `${date.format("YYYY年MM月DD日")} / ${WEEKDAY_LABELS[date.day()]}`;
}

export function formatHomeGreeting(source: string | Date = new Date()): string {
  const hour = dayjs(source).hour();

  if (hour < 5) {
    return "夜深了，先把心事轻轻放下。";
  }

  if (hour < 12) {
    return "早安，写下一点今天的光。";
  }

  if (hour < 18) {
    return "下午好，把此刻留给自己。";
  }

  return "晚上好，收一封给今天的信。";
}
