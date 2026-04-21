import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("dark shell structure", () => {
  it("keeps a dedicated dark symbol component and theme gate", () => {
    const homePage = readFileSync("src/features/home/pages/HomePage.vue", "utf8");
    const symbolComponent = readFileSync("src/features/dark-shell/components/ChisuSymbol.vue", "utf8");

    expect(homePage).toContain("DarkShellPage");
    expect(homePage).toContain("resolveThemeMode");
    expect(symbolComponent).toContain("◎");
    expect(symbolComponent).toContain("✉");
    expect(symbolComponent).toContain("▦");
  });

  it("renders archive page states and chisu-style iconography", () => {
    const archivePage = readFileSync("src/features/archive/pages/ArchivePage.vue", "utf8");

    expect(archivePage).toContain("view === 'main'");
    expect(archivePage).toContain("view === 'write'");
    expect(archivePage).toContain("view === 'success'");
    expect(archivePage).toContain("view === 'memory'");
    expect(archivePage).toContain("ChisuSymbol");
  });

  it("wires the dark shell sections instead of the placeholder scaffold", () => {
    const shellPage = readFileSync("src/features/dark-shell/pages/DarkShellPage.vue", "utf8");

    expect(shellPage).toContain("DarkTodaySection");
    expect(shellPage).toContain("DarkWritingSection");
    expect(shellPage).toContain("DarkFutureSection");
    expect(shellPage).toContain("DarkMailboxSection");
    expect(shellPage).toContain("mode=write");
  });
});
