import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("jotting editor stitch parity", () => {
  it("uses a dedicated jotting shell with the stitch image trigger source", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(jottingShell).toContain("jotting-editor-shell");
    expect(jottingShell).toContain("TopbarIconButton");
    expect(jottingShell).toContain("jotting-editor-shell__title-input");
    expect(jottingShell).toContain("@input=\"$emit('title-input', $event)\"");
    expect(editorPage).toContain(":title=\"title\"");
    expect(editorPage).toContain("@title-input=\"handleTitleInput\"");
    expect(jottingShell).toContain("jotting-editor-shell__meta-image-button");
    expect(editorPage).toContain(":show-image-action=\"showImageAction\"");
    expect(editorPage).toContain("@pick-images=\"handlePickImages\"");
  });

  it("hides the keyboard before switching a saved jotting into read mode", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain("uni.hideKeyboard");
    expect(editorPage).toContain('mode.value = "read";');
  });

  it("does not auto-focus jotting drafts when entering edit mode", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain('if (entryType.value === "jotting") {');
    expect(editorPage).toContain("function requestBodyFocusIfNeeded(): void");
  });
});
