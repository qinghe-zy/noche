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
    expect(homePage).not.toContain("Profile");
    expect(homeHero).not.toContain("Good morning");
    expect(homeHero).not.toContain("Good afternoon");
    expect(homeHero).not.toContain("Good evening");
  });

  it("uses localized navigation titles for mailbox and profile pages", () => {
    const pagesJson = readProjectFile("src/pages.json");

    expect(pagesJson).not.toContain("\"navigationBarTitleText\": \"Mailbox\"");
    expect(pagesJson).not.toContain("\"navigationBarTitleText\": \"Profile\"");
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
