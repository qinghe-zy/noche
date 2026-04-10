import { describe, expect, it } from "vitest";
import {
  formatCalendarGuideText,
  formatCalendarMonthLabel,
  formatCalendarYearLabel,
} from "@/features/calendar/calendarDisplay";

describe("calendar display helpers", () => {
  it("formats month and year labels in project language", () => {
    expect(formatCalendarMonthLabel("2026-04-10")).toBe("四月");
    expect(formatCalendarYearLabel("2026-04-10")).toBe("2026");
  });

  it("builds guide text for selected dates with and without records", () => {
    expect(formatCalendarGuideText(null, false)).toBe("选一个日期，查看已有记录或补写一篇日记。");
    expect(formatCalendarGuideText("2026-04-10", true)).toBe("2026-04-10 这一天已有记录，可继续阅读或查看当天归档。");
    expect(formatCalendarGuideText("2026-04-12", false)).toBe("2026-04-12 这一天还没有记录，可以补写一篇日记。");
  });
});
