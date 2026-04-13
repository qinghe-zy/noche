import { describe, expect, it, vi } from "vitest";
import { shouldResetFutureUnlockDate } from "@/features/editor/editorFutureDraft";

describe("editor future draft", () => {
  it("clears expired or today unlock dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));

    expect(shouldResetFutureUnlockDate("2026-04-11")).toBe(true);
    expect(shouldResetFutureUnlockDate("2026-04-10")).toBe(true);

    vi.useRealTimers();
  });

  it("keeps future unlock dates that are still valid", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));

    expect(shouldResetFutureUnlockDate("2026-04-12")).toBe(false);
    expect(shouldResetFutureUnlockDate(null)).toBe(false);

    vi.useRealTimers();
  });
});
