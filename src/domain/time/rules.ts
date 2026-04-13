import dayjs, { type ConfigType } from "dayjs";

export function lockRecordDate(source: ConfigType = new Date()): string {
  return dayjs(source).format("YYYY-MM-DD");
}

export function isFutureUnlockable(
  unlockDate: ConfigType,
  now: ConfigType = new Date(),
): boolean {
  return dayjs(unlockDate).startOf("day").valueOf() <= dayjs(now).startOf("day").valueOf();
}

export function isValidFutureLetterDate(
  candidate: ConfigType,
  now: ConfigType = new Date(),
): boolean {
  return (
    dayjs(candidate).startOf("day").valueOf() >=
    dayjs(now).startOf("day").add(1, "day").valueOf()
  );
}
