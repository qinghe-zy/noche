import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("calendar mailbox template guards", () => {
  it("shows the footer legend only when the selected day actually has entries", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).toContain("v-else-if=\"mailboxState.kind === 'entries'\"");
  });

  it("does not duplicate mailbox body copy in the empty state block", () => {
    const calendarPage = readProjectFile("src/features/calendar/pages/CalendarPage.vue");

    expect(calendarPage).not.toContain("<text v-else class=\"calendar-page__day-mailbox-empty-text\">{{ mailboxState.body }}</text>");
  });
});
