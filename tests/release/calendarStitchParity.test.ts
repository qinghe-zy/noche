import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
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
    expect(calendarPage).toContain("statusBarHeight.value + rpxToPx(32)");
  });

  it("starts moving calendar surfaces onto semantic tokens and heading fonts", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("var(--surface-primary");
    expect(calendarPage).toContain("var(--font-heading)");
    expect(calendarPage).toContain("var(--accent-brand)");
    expect(calendarPage).toContain("calendar-page--dark-shell");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell");
    expect(calendarPage).toContain(".theme-dark .calendar-page__day--selected");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__paper-panel");
    expect(calendarPage).toContain("border-color: rgba(214, 162, 77, 0.42);");
  });

  it("adds gold accents to each dark-shell mailbox history card instead of the outer mailbox shell", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).not.toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox {");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-item {");
    expect(calendarPage).toContain("rgba(214, 162, 77, 0.42)");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-date");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-title");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-item-type");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-item-date");
    expect(calendarPage).toContain(".theme-dark.calendar-page--dark-shell .calendar-page__day-mailbox-item-title");
    expect(calendarPage).toContain("color: #d6a24d;");
  });
});
