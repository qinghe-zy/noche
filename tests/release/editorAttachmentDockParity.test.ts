import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor attachment dock parity", () => {
  it("renders upload-image triggers inside each shell fixed area instead of a shared floating dock", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const headerMeta = readProjectFile("src/features/editor/components/DiaryPreludeHeaderMeta.vue");

    expect(editorPage).toContain("@pick-images=\"handlePickImages\"");
    expect(editorPage).not.toContain("editor-page__attachment-dock");
    expect(editorPage).not.toContain("showAttachmentDock");
    expect(editorPage).not.toContain("attachmentDockStyle");

    expect(futureShell).toContain("editor-page__meta-image-button");
    expect(diaryShell).toContain("diary-shell-edit__topbar-actions");
    expect(diaryShell).toContain("diary-shell-edit__topbar-image-button");
    expect(diaryShell).not.toContain(":show-image-action=\"showImageAction\"");
    expect(headerMeta).not.toContain("diary-prelude-header-meta__action-button");
    expect(jottingShell).toContain("jotting-editor-shell__meta-image-button");
    expect(jottingShell).toContain("jotting-shell-edit__topbar-actions");
    expect(jottingShell).toContain("jotting-shell-edit__topbar-image-button");
  });
});
