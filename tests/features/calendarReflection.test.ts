import { describe, expect, it } from "vitest";
import {
  resolveCalendarReflection,
  setCalendarReflectionProvider,
} from "@/features/calendar/calendarReflection";

describe("calendar reflection", () => {
  it("falls back to an elegant empty-day line when no provider exists", async () => {
    setCalendarReflectionProvider(null);

    await expect(
      resolveCalendarReflection({
        recordDate: "2026-04-01",
        hasEntries: false,
        entryCount: 0,
      }),
    ).resolves.toContain("还留着一页空白");
  });

  it("uses provider output when available", async () => {
    setCalendarReflectionProvider({
      async getReflection() {
        return "愿你在翻开这一天时，也重新照见自己。";
      },
    });

    await expect(
      resolveCalendarReflection({
        recordDate: "2026-04-01",
        hasEntries: true,
        entryCount: 2,
      }),
    ).resolves.toBe("愿你在翻开这一天时，也重新照见自己。");

    setCalendarReflectionProvider(null);
  });
});
