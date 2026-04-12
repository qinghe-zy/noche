import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("calendar day archive semantic parity", () => {
  it("loads day archive entries through calendar preview semantics instead of raw recordDate fetches", () => {
    const dayArchivePage = readProjectFile("src/features/day-archive/pages/DayArchivePage.vue");

    expect(dayArchivePage).toContain("useCalendarStore");
    expect(dayArchivePage).toContain("fetchSelectedDateEntries");
    expect(dayArchivePage).not.toContain("fetchEntriesByDate");
  });
});
