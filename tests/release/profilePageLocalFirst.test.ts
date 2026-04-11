import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile page local-first constraints", () => {
  it("does not keep prototype remote resources in profile surfaces", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");

    expect(profilePage).not.toContain("fonts.googleapis.com");
    expect(profilePage).not.toContain("tailwindcss.com");
    expect(profilePage).not.toContain("googleusercontent.com");
    expect(profilePage).not.toContain("http://");
    expect(profilePage).not.toContain("https://");
    expect(profileHero).not.toContain("fonts.googleapis.com");
    expect(profileHero).not.toContain("https://");
  });

  it("keeps appearance settings on the profile main page and uses lighter edit cues", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");
    const optionSheet = readProjectFile("src/shared/ui/PaperOptionSheet.vue");
    const inputDialog = readProjectFile("src/shared/ui/PaperInputDialog.vue");

    expect(profilePage).toContain("appearance-settings");
    expect(profilePage).toContain("外观设置");
    expect(profilePage).not.toContain("profile-page__topbar");
    expect(profilePage).not.toContain("uni.showModal");
    expect(profilePage).not.toContain("uni.showActionSheet");
    expect(profileHero).toContain("profile-corner-cover.svg");
    expect(profileHero).not.toContain("轻点名字或签名修改");
    expect(profileHero).not.toContain(">改头像<");
    expect(optionSheet).toContain("paper-option-sheet");
    expect(inputDialog).toContain("paper-input-dialog");
  });
});
