import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("release readiness", () => {
  it("has a non-empty appid for app packaging", () => {
    const manifest = JSON.parse(readProjectFile("src/manifest.json")) as { appid?: string };

    expect(manifest.appid?.trim()).toBeTruthy();
  });

  it("points android app icons at the bundled local png asset", () => {
    const manifest = JSON.parse(readProjectFile("src/manifest.json")) as {
      ["app-plus"]?: {
        distribute?: {
          icons?: {
            android?: Record<string, string>;
          };
        };
      };
    };
    const androidIcons = manifest["app-plus"]?.distribute?.icons?.android;

    expect(androidIcons?.hdpi).toBe("screen.png");
    expect(androidIcons?.xhdpi).toBe("screen.png");
    expect(androidIcons?.xxhdpi).toBe("screen.png");
    expect(androidIcons?.xxxhdpi).toBe("screen.png");
  });

  it("enables sqlite support in app-plus modules for packaged runtime", () => {
    const manifest = JSON.parse(readProjectFile("src/manifest.json")) as {
      ["app-plus"]?: {
        modules?: Record<string, unknown>;
      };
    };

    expect(manifest["app-plus"]?.modules?.SQLite).toBeTruthy();
  });

  it("keeps dcloud runtime dependencies aligned above the 4.84 packaging line", () => {
    const pkg = JSON.parse(readProjectFile("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const versions = [
      pkg.dependencies?.["@dcloudio/uni-app"],
      pkg.dependencies?.["@dcloudio/uni-app-plus"],
      pkg.devDependencies?.["@dcloudio/vite-plugin-uni"],
      pkg.devDependencies?.["@dcloudio/uni-cli-shared"],
    ];

    for (const version of versions) {
      expect(version).toBeTruthy();
      expect(version).not.toContain("40804");
    }
  });

  it("applies dark theme tokens to app and uni page containers instead of only document nodes", () => {
    const appVue = readProjectFile("src/App.vue");
    const themeFile = readProjectFile("src/shared/theme.ts");

    expect(appVue).toContain(".theme-dark");
    expect(appVue).toContain(".theme-light");
    expect(themeFile).toContain("resolveThemeClass");
    expect(themeFile).not.toContain("querySelectorAll");
  });

  it("removes the privacy-lock overlay from the shipped app shell", () => {
    const appVue = readProjectFile("src/App.vue");

    expect(appVue).not.toContain("privacy-lock");
    expect(appVue).not.toContain("settingsStore.privacyLockEnabled");
  });

  it("keeps release-facing surfaces wired to shared dark-theme tokens", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const profileHero = readProjectFile("src/features/profile/components/ProfileHero.vue");

    expect(homePage).toContain("var(--noche-bg)");
    expect(homePage).toContain("var(--noche-text)");
    expect(diaryShell).toContain("var(--noche-bg)");
    expect(jottingShell).toContain("var(--noche-bg)");
    expect(futureShell).toContain("var(--noche-bg)");
    expect(profileHero).toContain("var(--noche-bg)");
  });

  it("does not leave profile page as TODO placeholder", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).not.toContain("TODO");
    expect(profilePage).not.toContain("implement profile");
    expect(profilePage).not.toContain("later");
  });

  it("uses localized home entry labels instead of english prototype copy", () => {
    const homePage = readProjectFile("src/features/home/pages/HomePage.vue");
    const homeHero = readProjectFile("src/features/home/components/HomeHero.vue");

    expect(homePage).not.toContain("Write Today");
    expect(homePage).not.toContain("Quick Jotting");
    expect(homePage).not.toContain("To Future");
    expect(homePage).not.toContain("Mailbox");
    expect(homeHero).not.toContain("Good morning");
    expect(homeHero).not.toContain("Good afternoon");
    expect(homeHero).not.toContain("Good evening");
  });

  it("uses localized navigation titles for mailbox and profile pages", () => {
    const pagesJson = readProjectFile("src/pages.json");

    expect(pagesJson).not.toContain("\"navigationBarTitleText\": \"Mailbox\"");
    expect(pagesJson).not.toContain("\"navigationBarTitleText\": \"Profile\"");
  });

  it("uses custom navigation for feature pages so the system title bar does not stack on top", () => {
    const pagesJson = readProjectFile("src/pages.json");

    expect(pagesJson).toContain("\"path\": \"features/home/pages/HomePage\"");
    expect(pagesJson).toContain("\"path\": \"features/editor/pages/EditorPage\"");
    expect(pagesJson).toContain("\"path\": \"features/mailbox/pages/MailboxPage\"");
    expect(pagesJson).toContain("\"path\": \"features/calendar/pages/CalendarPage\"");
    expect(pagesJson).toContain("\"path\": \"features/day-archive/pages/DayArchivePage\"");
    expect(pagesJson).toContain("\"path\": \"features/profile/pages/ProfilePage\"");
    expect(pagesJson).toContain("\"navigationStyle\": \"custom\"");
  });

  it("does not leave editor page in english prototype copy", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).not.toContain("Write while the day is still warm");
    expect(editorPage).not.toContain("Save Today");
    expect(editorPage).not.toContain("Seal Letter");
    expect(editorPage).not.toContain("Continue Write");
    expect(editorPage).not.toContain("Draft saved");
    expect(editorPage).not.toContain("Write something first");
  });
});
