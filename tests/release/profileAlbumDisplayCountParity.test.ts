import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile album display count parity", () => {
  it("keeps the home strip fixed at four while routing album display count to the full album page", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const profileAlbumPage = readProjectFile("src/features/profile/pages/ProfileAlbumPage.vue");
    const profileData = readProjectFile("src/features/profile/profileData.ts");

    expect(profilePage).toContain("PROFILE_PREVIEW_LIMIT");
    expect(profileData).toContain("PROFILE_PREVIEW_LIMIT = 4");
    expect(profileAlbumPage).toContain("settingsStore.albumDisplayCount");
    expect(profileAlbumPage).toContain("profile-album-page__load-more");
  });

  it("surfaces a dedicated photo-wall display-count option in appearance settings", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(profilePage).toContain('key: "album-display-count"');
    expect(profilePage).toContain('case "appearance-album-count"');
    expect(i18n).toContain('albumDisplayCountTitle');
    expect(i18n).toContain('albumDisplayCountSmall');
    expect(i18n).toContain('albumDisplayCountMedium');
    expect(i18n).toContain('albumDisplayCountAll');
  });
});
