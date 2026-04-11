import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("visual regression structure", () => {
  it("keeps future editor shell aligned to the immersive stationery layout skeleton", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(futureShell).toContain("editor-page__topbar");
    expect(futureShell).toContain("editor-page__paper-surface");
    expect(futureShell).toContain("editor-page__writing-lines");
    expect(futureShell).toContain("editor-page__writing-area");
    expect(editorPage).toContain("DiaryEditorShell");
    expect(editorPage).toContain("JottingEditorShell");
    expect(editorPage).toContain("FutureLetterEditorShell");
  });

  it("keeps profile page aligned to the private corner layout skeleton", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain("profile-page__topbar");
    expect(profilePage).toContain("profile-page__portrait");
    expect(profilePage).toContain("profile-page__menu");
    expect(profilePage).toContain("profile-page__footer");
  });
});
