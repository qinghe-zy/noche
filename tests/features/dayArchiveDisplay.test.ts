import { describe, expect, it } from "vitest";
import {
  formatDayArchiveEmptyText,
  formatDayArchiveSubtitle,
  formatDayArchiveTitle,
} from "@/features/day-archive/dayArchiveDisplay";

describe("day archive display helpers", () => {
  it("formats title and subtitle in project language", () => {
    expect(formatDayArchiveTitle("2026-04-10")).toBe("2026年04月10日");
    expect(formatDayArchiveSubtitle(1)).toBe("这一天收着 1 封可阅读记录");
    expect(formatDayArchiveSubtitle(3)).toBe("这一天收着 3 封可阅读记录");
  });

  it("formats empty state text with the current record date", () => {
    expect(formatDayArchiveEmptyText("2026-04-10")).toBe("2026年04月10日还没有可阅读的记录。");
  });
});
