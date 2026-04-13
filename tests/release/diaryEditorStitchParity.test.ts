import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("diary editor stitch parity", () => {
  it("uses a dedicated diary shell instead of the future stationery page", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(diaryShell).toContain("diary-editor-shell");
    expect(diaryShell).toContain("AppIcon name=\"image\"");
    expect(diaryShell).toContain("DiaryPreludeHeaderMeta");
    expect(diaryShell).toContain("TopbarIconButton");
    expect(diaryShell).not.toContain("diary-editor-shell__inkwell");
    expect(diaryShell).not.toContain("AppIcon name=\"palette\"");
    expect(diaryShell).toContain("handlePickImagesTrigger");
    expect(diaryShell).toContain("@click=\"handlePickImagesTrigger\"");
    expect(diaryShell).not.toContain("DiaryPreludeInlineCard");
    expect(editorPage).toContain("DiaryPreludePicker");
  });

  it("uses the in-app paper confirm dialog instead of the system modal for destructive diary actions", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain("PaperConfirmDialog");
    expect(editorPage).not.toContain("uni.showModal({");
    expect(editorPage).toContain("isDestroyDraftDialogOpen");
  });

  it("renders diary prelude icons after time instead of text labels in the header row", () => {
    const headerMeta = readProjectFile("src/features/editor/components/DiaryPreludeHeaderMeta.vue");

    expect(headerMeta).toContain("DiaryPreludeGlyph");
    expect(headerMeta).toContain("diary-prelude-header-meta__icon");
    expect(headerMeta).not.toContain("weatherLabelZh");
    expect(headerMeta).not.toContain("moodLabelZh");
    expect(headerMeta).toContain("props.mode === \"read\"");
  });

  it("lets diary titles stay user-authored and optional instead of stealing the body copy", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(diaryShell).toContain("diary-editor-shell__title-input");
    expect(diaryShell).toContain("@input=\"$emit('title-input', $event)\"");
    expect(editorPage).toContain(":title=\"title\"");
    expect(editorPage).toContain("@title-input=\"handleTitleInput\"");
  });
});
