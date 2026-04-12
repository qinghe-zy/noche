import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor stitch parity", () => {
  it("keeps the immersive stationery scaffold", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("editor-page__topbar");
    expect(editorPage).toContain("editor-page__paper-surface");
    expect(editorPage).toContain("editor-page__writing-lines");
    expect(editorPage).toContain("editor-page__writing-area");
  });

  it("uses local editor icons instead of remote font ligatures", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("AppIcon");
    expect(editorPage).toContain("TopbarIconButton");
    expect(editorPage).not.toContain("fonts.googleapis.com");
  });

  it("uses 18px body text for writing and reading on stationery pages", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("font-size: 18px;");
  });

  it("keeps editor shells local-first and does not rely on remote font cdn imports", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).not.toContain("fonts.googleapis.com");
    expect(jottingShell).not.toContain("fonts.googleapis.com");
    expect(futureShell).not.toContain("fonts.googleapis.com");
  });

  it("prevents keyboard focus from pushing the whole writing page upward", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).toContain("adjust-position=\"false\"");
    expect(jottingShell).toContain("adjust-position=\"false\"");
    expect(futureShell).toContain("adjust-position=\"false\"");
  });

  it("keeps the future letter shell full-screen and immersive instead of a centered white card", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("noche-mobile-page");
    expect(futureShell).toContain(".editor-page__canvas { padding: 0;");
    expect(futureShell).toContain("max-width: none;");
    expect(futureShell).toContain("min-height: 0;");
    expect(futureShell).toContain("var(--noche-page-bottom-padding)");
    expect(futureShell).toContain("box-shadow: none;");
    expect(futureShell).toContain("border: none;");
  });
});
