import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("calendar stitch parity", () => {
  it("keeps the editorial calendar scaffold from stitch", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("calendar-page__hero");
    expect(calendarPage).toContain("calendar-page__paper-panel");
    expect(calendarPage).toContain("calendar-page__day-mailbox");
    expect(calendarPage).toContain("calendar-page__day-mailbox-list");
  });

  it("uses local shared icons for navigation controls", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("TopbarIconButton");
    expect(calendarPage).toContain("AppIcon");
    expect(calendarPage).toContain("padding: 28rpx 32rpx 24rpx;");
  });
});
