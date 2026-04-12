import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("home profile entry polish", () => {
  it("uses a clear profile entry with a larger touch target and explicit text label", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).not.toContain(">person<");
    expect(homePage).toContain("home-page__topnav-profile-text");
    expect(homePage).toContain("个人中心");
    expect(homePage).toContain(".home-page__topnav-profile-entry {");
    expect(homePage).toContain("home-page__topnav-profile-icon");
    expect(homePage).toContain("border-radius: 9999rpx;");
  });

  it("keeps the home main area slightly lower instead of crowding the title near the top edge", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("PageScaffold");
    expect(homePage).toContain("min-height: var(--noche-content-min-height);");
    expect(homePage).toContain("justify-content: flex-start;");
  });
});
