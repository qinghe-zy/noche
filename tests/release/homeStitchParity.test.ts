import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveHomeDailyPrompt } from "@/features/home/homePrompt";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home stitch parity", () => {
  it("keeps the premium stationery scaffold from stitch", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__paper-premium");
    expect(homePage).toContain("home-page__paper-texture");
    expect(homePage).toContain("home-page__letter-spacing-widest");
    expect(homePage).toContain("home-page__nav-entry");
  });

  it("keeps home runtime local-first without remote fonts or texture assets", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).not.toContain("fonts.googleapis.com");
    expect(homePage).not.toContain("googleusercontent.com");
    expect(homePage).not.toContain("https://");
    expect(homePage).not.toContain("Material Symbols");
  });

  it("keeps diary as the single primary entry and avoids a duplicated diary shortcut", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("handleNavigate('editor', { type: 'diary', recordDate: todayDateKey })");
    expect(homePage).not.toContain(">日记</text>");
    expect(homePage).not.toContain(">写一张随笔</text>");
  });

  it("uses a date-stable daily prompt for the primary diary card", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const prompt = resolveHomeDailyPrompt("2026-04-12");

    expect(homePage).toContain("resolveHomeDailyPrompt(todayDateKey.value)");
    expect(prompt.subtitleZh).toBe("致今日");
    expect(prompt.subtitleEn).toBe("To Today");
  });

  it("does not rely on inline svg icons for the packaged app runtime", () => {
    const appIcon = readProjectFile("src/shared/ui/AppIcon.vue");

    expect(appIcon).toContain("<image");
    expect(appIcon).toContain("data:image/svg+xml;utf8,");
  });
});
