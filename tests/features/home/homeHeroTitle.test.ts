import { describe, expect, it, vi } from "vitest";
import {
  HOME_HIDDEN_TITLE,
  HOME_RANDOM_TITLES,
  resolveHomeHeroTitle,
  resolveRandomHomeTitle,
} from "@/features/home/homeHeroTitle";

describe("home hero title", () => {
  it("uses the trimmed custom title when custom mode is selected", () => {
    expect(resolveHomeHeroTitle({
      dateKey: "2026-04-12",
      locale: "zh-CN",
      fallbackTitle: "见字如面",
      titleMode: "custom",
      customTitle: "  纸上光阴  ",
    })).toBe("纸上光阴");
  });

  it("falls back to the random pool when the custom title is blank", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.2);

    expect(resolveHomeHeroTitle({
      dateKey: "2026-04-12",
      locale: "zh-CN",
      fallbackTitle: "见字如面",
      titleMode: "custom",
      customTitle: "   ",
    })).toBe("纸上光阴");

    randomSpy.mockRestore();
  });

  it("keeps english mode fixed on Eyot even when random mode is selected", () => {
    expect(resolveHomeHeroTitle({
      dateKey: "2026-04-12",
      locale: "en-US",
      fallbackTitle: "Eyot",
      titleMode: "random",
      customTitle: "Paper Echo",
    })).toBe("Eyot");
  });

  it("surfaces the hidden title when the random draw lands in the hidden slot", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.01);

    expect(resolveHomeHeroTitle({
      dateKey: "2026-04-13",
      locale: "zh-CN",
      fallbackTitle: "见字如面",
      titleMode: "random",
      customTitle: "",
    })).toBe(HOME_HIDDEN_TITLE);

    randomSpy.mockRestore();
  });

  it("uses the curated zh random title pool on ordinary random draws", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.2);
    const title = resolveRandomHomeTitle("2026-04-12", "zh-CN", "见字如面");

    expect(title).toBe("纸上光阴");
    expect(HOME_RANDOM_TITLES).toContain(title);

    randomSpy.mockRestore();
  });

  it("does not bind zh random titles to the calendar date when the random draw is the same", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.2);

    const first = resolveHomeHeroTitle({
      dateKey: "2026-04-12",
      locale: "zh-CN",
      fallbackTitle: "见字如面",
      titleMode: "random",
      customTitle: "",
    });
    const second = resolveHomeHeroTitle({
      dateKey: "2031-11-09",
      locale: "zh-CN",
      fallbackTitle: "见字如面",
      titleMode: "random",
      customTitle: "",
    });

    expect(first).toBe(second);
    randomSpy.mockRestore();
  });
});
