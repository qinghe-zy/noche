import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("calendar interaction behavior", () => {
  it("uses stack-aware back navigation instead of forcing a mailbox relaunch", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("navigateBackOrFallback");
  });

  it("uses the shared paper confirm dialog for locked future entry hints", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("PaperConfirmDialog");
    expect(calendarPage).not.toContain("uni.showModal({");
  });

  it("renders diary prelude icons in the day mailbox cards", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("DiaryPreludeGlyph");
    expect(calendarPage).toContain("calendar-page__day-mailbox-item-prelude");
  });

  it("unlocks the calendar body scroll as soon as the day mailbox has entries", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("shouldUnlockPageScroll");
    expect(calendarPage).toContain("bodyContainerTag");
    expect(calendarPage).toContain("mailboxState.value.kind === \"entries\"");
    expect(calendarPage).toContain("<component :is=\"bodyContainerTag\"");
    expect(calendarPage).not.toContain("max-height: 280px;");
    expect(calendarPage).not.toContain("overflow-y: auto;");
  });

  it("uses long-press delete on day mailbox cards and lightly strengthens today with absolutely positioned markers", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("@longpress=\"handleEntryLongPress(entry)\"");
    expect(calendarPage).toContain("isDeleteDialogOpen");
    expect(calendarPage).toContain("deleteDialogActions");
    expect(calendarPage).toContain(".calendar-page__day--today .calendar-page__day-number");
    expect(calendarPage).toContain("font-size: 20px;");
    expect(calendarPage).toContain(".calendar-page__marker {\n  position: absolute;");
  });

  it("uses a navigator-based CTA for the empty day mailbox action instead of relying on a plain button click only", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("mailboxActionUrl");
    expect(calendarPage).toContain("<navigator");
    expect(calendarPage).toContain(":url=\"mailboxActionUrl\"");
    expect(calendarPage).not.toContain("<button");
  });

  it("keeps the month panel top anchored while tightening its height by 48rpx and proportionally compressing inner spacing", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("padding: 24px 18px calc(22px - 24rpx);");
    expect(calendarPage).toContain("margin-bottom: calc(20px - 8rpx);");
    expect(calendarPage).toContain("margin-bottom: calc(18px - 6rpx);");
    expect(calendarPage).toContain("row-gap: calc(26px - 10rpx);");
    expect(calendarPage).not.toContain("margin-top: -48rpx;");
  });
});
