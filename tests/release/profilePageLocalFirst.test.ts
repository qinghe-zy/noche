import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
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
    expect(profilePage).toContain("copy.value.profile.appearanceTitle");
    expect(profilePage).not.toContain("profile-page__topbar");
    expect(profilePage).not.toContain("uni.showModal");
    expect(profilePage).not.toContain("uni.showActionSheet");
    expect(profileHero).toContain("@tap=\"$emit('preview-cover')\"");
    expect(profileHero).toContain("preview-avatar");
    expect(profileHero).toContain("@tap=\"$emit('edit-display-name')\"");
    expect(profileHero).toContain("点击修改昵称");
    expect(profileHero).toContain("profile-hero__avatar-plus");
    expect(profileHero).not.toContain("profile-hero__avatar-edit");
    expect(profileHero).not.toContain("profile-hero__profile-edit");
    expect(profilePage).toContain("ProfileMediaViewer");
    expect(optionSheet).toContain("paper-option-sheet");
    expect(inputDialog).toContain("paper-input-dialog");
  });

  it("keeps the profile album as a four-up recent strip with a fixed empty-state line", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileAlbum = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");

    expect(profilePage).toContain("PROFILE_PREVIEW_LIMIT");
    expect(profileAlbum).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));");
    expect(profileAlbum).toContain("copy.profile.albumViewAll");
    expect(profileAlbum).toContain("copy.profile.albumEmptyFixed");
  });

  it("adds stronger profile-specific text contrast tokens instead of leaving key profile copy on the weakest muted tone", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");
    const profileActionList = readProjectFile("src/features/profile/components/ProfileActionList.vue");
    const profileStats = readProjectFile("src/features/profile/components/ProfileStatsRow.vue");

    expect(profilePage).toContain("--profile-soft-text");
    expect(profilePage).toContain("--profile-soft-meta");
    expect(profileHero).toContain("var(--profile-soft-text");
    expect(profileActionList).toContain("var(--profile-soft-meta");
    expect(profileStats).toContain("var(--profile-soft-meta");
  });

  it("starts moving profile surfaces onto semantic theme tokens and heading/body font stacks", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");
    const profileActionList = readProjectFile("src/features/profile/components/ProfileActionList.vue");
    const profileAlbum = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");

    expect(profilePage).toContain("var(--surface-primary");
    expect(profileHero).toContain("var(--font-heading)");
    expect(profileActionList).toContain("var(--surface-primary");
    expect(profileAlbum).toContain("var(--font-heading)");
  });
});
