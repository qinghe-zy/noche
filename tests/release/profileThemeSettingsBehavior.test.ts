import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("profile theme settings behavior", () => {
  it("separates theme style from theme mode in the appearance sheet", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain('key: "theme-family"');
    expect(profilePage).toContain('key: "theme-mode"');
    expect(profilePage).toContain('activeSheet.value = "appearance-theme-family"');
    expect(profilePage).toContain('activeSheet.value = "appearance-theme-mode"');
  });

  it("offers Claude as a localized theme family option", () => {
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(i18n).toContain("themeStyleTitle");
    expect(i18n).toContain("themeModeTitle");
    expect(i18n).toContain("themeClaude");
    expect(i18n).toContain("themeDefault");
  });
});
