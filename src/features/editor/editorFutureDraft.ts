import { isFutureUnlockable } from "@/domain/time/rules";

export function shouldResetFutureUnlockDate(unlockDate: string | null | undefined): boolean {
  if (!unlockDate) {
    return false;
  }

  return isFutureUnlockable(unlockDate);
}
