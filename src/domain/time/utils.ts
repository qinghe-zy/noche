import dayjs from 'dayjs';

/**
 * 获取当前本地日期，格式 YYYY-MM-DD
 * 用于 recordDate 锁定逻辑
 */
export function getTodayDate(): string {
  return dayjs().format('YYYY-MM-DD');
}

/**
 * 判断给定的日期字符串是否为今天
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDate();
}

/**
 * 判断给定日期是否已过去（不含今天）
 */
export function isPastDate(dateStr: string): boolean {
  return dayjs(dateStr).isBefore(dayjs(), 'day');
}

/**
 * 判断未来信是否可以解锁
 * 规则：到达解锁日 00:00 本地时间即可开启
 */
export function isFutureLetterUnlockable(unlockDate: string): boolean {
  return !dayjs(unlockDate).isAfter(dayjs(), 'day');
}

/**
 * 获取未来信最早可选日期（明天）
 */
export function getEarliestFutureLetterDate(): string {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

/**
 * 格式化时间戳用于展示
 */
export function formatTimestamp(ts: number, pattern = 'YYYY-MM-DD HH:mm'): string {
  return dayjs(ts).format(pattern);
}
