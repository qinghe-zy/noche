import { describe, expect, it } from "vitest";
import {
  formatCalendarGuideText,
  formatCalendarMonthLabel,
  formatCalendarYearLabel,
} from "@/features/calendar/calendarDisplay";

describe("calendar display helpers", () => {
  it("formats month and year labels in the active locale", () => {
    expect(formatCalendarMonthLabel("2026-04-10", "zh-CN")).toBe("四月");
    expect(formatCalendarMonthLabel("2026-04-10", "en-US")).toBe("April");
    expect(formatCalendarYearLabel("2026-04-10", "zh-CN")).toBe("2026");
    expect(formatCalendarYearLabel("2026-04-10", "en-US")).toBe("2026");
  });

  it("builds guide text for selected dates with and without records in both locales", () => {
    expect(formatCalendarGuideText(null, false, "zh-CN")).toBe("选一个日期，查看已有记录或补写一篇日记。");
    expect(formatCalendarGuideText("2026-04-10", true, "zh-CN")).toBe("2026-04-10 这一天已有记录，可继续阅读或查看当天归档。");
    expect(formatCalendarGuideText("2026-04-12", false, "zh-CN")).toBe("2026-04-12 这一天还没有记录，可以补写一篇日记。");

    expect(formatCalendarGuideText(null, false, "en-US")).toBe("Choose a day to revisit saved pages or write for that date.");
    expect(formatCalendarGuideText("2026-04-10", true, "en-US")).toBe("2026-04-10 already has saved pages. You can reopen them or view the day archive.");
    expect(formatCalendarGuideText("2026-04-12", false, "en-US")).toBe("2026-04-12 is still blank. You can write a diary page for this day.");
  });
});
