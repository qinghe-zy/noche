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
});
