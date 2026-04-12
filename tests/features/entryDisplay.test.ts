import { describe, expect, it } from "vitest";
import { fallbackEntryTitle, formatEntryTypeLabel } from "@/features/entries/entryDisplay";

describe("entry display helpers", () => {
  it("formats entry type labels in shared project language", () => {
    expect(formatEntryTypeLabel("diary")).toBe("日记");
    expect(formatEntryTypeLabel("jotting")).toBe("随笔");
    expect(formatEntryTypeLabel("future")).toBe("致未来");
  });

  it("builds fallback titles without leaking page-specific wording", () => {
    expect(fallbackEntryTitle("diary")).toBe("日记");
    expect(fallbackEntryTitle("jotting")).toBe("随笔");
    expect(fallbackEntryTitle("future")).toBe("已开启的致未来");
  });
});
