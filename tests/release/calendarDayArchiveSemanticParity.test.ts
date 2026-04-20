import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("calendar day archive semantic parity", () => {
  it("loads day archive entries through calendar preview semantics instead of raw recordDate fetches", () => {
    const dayArchivePage = readProjectFile("src/features/day-archive/pages/DayArchivePage.vue");

    expect(dayArchivePage).toContain("useCalendarStore");
    expect(dayArchivePage).toContain("fetchSelectedDateEntries");
    expect(dayArchivePage).not.toContain("fetchEntriesByDate");
  });

  it("starts moving day archive surfaces onto semantic tokens and heading fonts", () => {
    const dayArchivePage = readProjectFile("src/features/day-archive/pages/DayArchivePage.vue");

    expect(dayArchivePage).toContain("var(--surface-primary");
    expect(dayArchivePage).toContain("var(--font-heading)");
    expect(dayArchivePage).toContain("var(--font-body)");
  });
});
