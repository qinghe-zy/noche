import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

  it("uses the stitch typography imports instead of the simplified local layout", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("fonts.googleapis.com/css2?family=Noto+Serif+SC");
    expect(homePage).toContain("fonts.googleapis.com/css2?family=Material+Symbols+Outlined");
  });

  it("keeps diary as the single primary entry and avoids a duplicated diary shortcut", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("handleNavigate('editor', { type: 'diary' })");
    expect(homePage).not.toContain(">日记</text>");
    expect(homePage).not.toContain(">写一张随笔</text>");
  });
});
