import { describe, expect, it } from "vitest";
import { formatArchiveHistoryDate } from "@/features/archive/archiveDisplay";

describe("archiveDisplay", () => {
  it("formats history date for zh-CN", () => {
    expect(formatArchiveHistoryDate("2026-04-21", "zh-CN")).toBe("04.21");
  });
});
