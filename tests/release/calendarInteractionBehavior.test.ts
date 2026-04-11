import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
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
});
