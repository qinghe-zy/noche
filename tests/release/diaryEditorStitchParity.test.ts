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
    expect(diaryShell).toContain("DiaryPreludeHeaderMeta");
    expect(diaryShell).toContain("TopbarIconButton");
    expect(diaryShell).not.toContain("diary-editor-shell__inkwell");
    expect(diaryShell).not.toContain("AppIcon name=\"palette\"");
    expect(diaryShell).not.toContain("DiaryPreludeInlineCard");
    expect(editorPage).toContain("DiaryPreludePicker");
    expect(editorPage).toContain(":show-image-action=\"showImageAction\"");
    expect(editorPage).toContain("@pick-images=\"handlePickImages\"");
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

  it("collapses diary chrome into date plus title plus prelude icons instead of keeping subtitle and time in the topbar", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const headerMeta = readProjectFile("src/features/editor/components/DiaryPreludeHeaderMeta.vue");

    expect(diaryShell).toContain("diary-shell-read__date");
    expect(diaryShell).toContain("diary-shell-read__title");
    expect(diaryShell).toContain("diary-shell-read__title-icons");
    expect(diaryShell).toContain("diary-shell-edit__title-display");
    expect(diaryShell).toContain("variant=\"compact-icons\"");
    expect(diaryShell).not.toContain("diary-editor-shell__topbar-center literary-text");
    expect(headerMeta).toContain("variant?: \"default\" | \"compact-icons\"");
    expect(headerMeta).toContain("props.variant === \"compact-icons\"");
  });

  it("keeps diary prelude glyphs visible and editable in edit mode instead of hiding them behind plain copy", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");

    expect(diaryShell).toContain("const showEditablePreludeGlyphs = computed(() => props.mode === \"edit\");");
    expect(diaryShell).toContain(":show-glyphs=\"showEditablePreludeGlyphs\"");
    expect(diaryShell).toContain("@edit=\"$emit('edit-diary-prelude')\"");
    expect(diaryShell).not.toContain(":show-glyphs=\"false\"");
  });
});
