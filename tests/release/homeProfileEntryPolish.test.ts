import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home profile entry polish", () => {
  it("uses a clear text profile entry without avatar-like icon or framed button chrome", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).not.toContain(">person<");
    expect(homePage).toContain("home-page__topnav-profile-text");
    expect(homePage).toContain("个人主页");
    expect(homePage).toContain(".home-page__topnav-profile-entry {");
    expect(homePage).toContain("border: none;");
  });

  it("keeps the home main area slightly lower instead of crowding the title near the top edge", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("min-height: var(--noche-nav-bar-height);");
    expect(homePage).toContain("padding: var(--noche-status-bar-height) var(--noche-page-padding-x) 0;");
    expect(homePage).toContain("min-height: var(--noche-content-min-height);");
    expect(homePage).not.toContain("margin-top: 12px;");
  });
});
