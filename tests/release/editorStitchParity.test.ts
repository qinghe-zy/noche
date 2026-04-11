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
});
