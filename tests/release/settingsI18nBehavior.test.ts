import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("settings i18n behavior", () => {
  it("keeps settings option sheets localized through the shared i18n copy", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain("copy.value.settings.followSystem");
    expect(profilePage).toContain("copy.value.settings.light");
    expect(profilePage).toContain("copy.value.settings.dark");
    expect(profilePage).toContain("copy.value.profile.coverSheetTitle");
    expect(profilePage).toContain("copy.value.profile.avatarSheetTitle");
    expect(profilePage).toContain("copy.value.settings.writingPresetSmall");
    expect(profilePage).toContain("copy.value.settings.writingPresetMedium");
    expect(profilePage).toContain("copy.value.settings.writingPresetLarge");
    expect(profilePage).toContain("copy.value.profile.writingSettingsTitle");
    expect(profilePage).toContain("copy.value.profile.homeTitleTitle");
    expect(profilePage).toContain("copy.value.settings.homeTitleRandom");
    expect(profilePage).toContain("copy.value.settings.homeTitleCustom");
    expect(profilePage).toContain("copy.value.settings.futureLinesOn");
    expect(profilePage).toContain("copy.value.settings.futureLinesOff");
    expect(profilePage).toContain("copy.value.settings.weekStartsSunday");
    expect(profilePage).toContain("copy.value.settings.weekStartsMonday");
    expect(profilePage).toContain("copy.value.settings.chinese");
    expect(profilePage).toContain("copy.value.settings.english");
  });

  it("returns from theme, week, and locale pickers to the appearance root sheet", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain('activeSheet.value = "appearance-root"');
    expect(profilePage).toContain('activeSheet.value = "appearance-home-title"');
    expect(profilePage).not.toContain('case "appearance-theme":\n      settingsStore.setTheme(key as ThemeOption);\n      closeSheet();');
  });

  it("explains backup export unavailability with localized copy instead of surfacing raw runtime text", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain("copy.value.profile.backupUnavailable");
    expect(profilePage).not.toContain("error instanceof Error ? error.message");
  });

  it("uses locale-aware compact labels on the home secondary navigation", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");

    expect(homePage).toContain("home-page__nav-entry-label--latin");
    expect(homePage).toContain("settingsStore.locale === \"en-US\"");
  });
});
