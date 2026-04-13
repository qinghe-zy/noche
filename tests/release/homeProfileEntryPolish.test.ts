import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home profile entry polish", () => {
  it("uses a dedicated profile entry marker without avatar-like person icon or framed button chrome", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).not.toContain(">person<");
    expect(homePage).toContain("copy.home.profileCenter");
    expect(homePage).toContain("home-page__topnav-profile-text");
    expect(homePage).toContain(".home-page__topnav-profile-entry {");
    expect(homePage).toContain("border: none;");
  });

  it("keeps the home main area slightly lower instead of crowding the title near the top edge", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("useEditorKeyboardViewport");
    expect(homePage).toContain("paddingTop: `${homeTop.value + rpxToPx(36)}px`");
    expect(homePage).toContain("height: 100vh;");
  });

  it("adds a quiet micro-subtitle beneath the home hero title", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(homePage).toContain("home-page__hero-subtitle");
    expect(homePage).toContain("copy.home.heroSubtitle");
    expect(i18n).toContain("把外界的纷乱关在门外，很高兴遇见你。");
  });
});
