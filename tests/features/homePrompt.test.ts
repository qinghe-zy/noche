import { describe, expect, it } from "vitest";
import { resolveHomeDailyPrompt } from "@/features/home/homePrompt";

describe("home daily prompt", () => {
  it("returns a stable prompt for the same date", () => {
    expect(resolveHomeDailyPrompt("2026-04-12")).toEqual(resolveHomeDailyPrompt("2026-04-12"));
  });

  it("provides both chinese and english prompt copy", () => {
    const prompt = resolveHomeDailyPrompt("2026-04-13");

    expect(prompt.primaryZh.length).toBeGreaterThan(0);
    expect(prompt.primaryEn.length).toBeGreaterThan(0);
    expect(prompt.subtitleZh).toBe("致今日");
    expect(prompt.subtitleEn).toBe("To Today");
  });
});
