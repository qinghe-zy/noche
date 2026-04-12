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
    expect(homePage).toContain("home-page__topnav-profile-mark");
    expect(homePage).toContain(".home-page__topnav-profile-entry {");
    expect(homePage).toContain("border: none;");
  });

  it("keeps the home main area slightly lower instead of crowding the title near the top edge", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("margin-top: 12px;");
  });
});
