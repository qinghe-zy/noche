import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor image insert sheet", () => {
  it("uses the in-app paper option sheet before opening camera or album", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(editorPage).toContain("PaperOptionSheet");
    expect(editorPage).toContain("isImageInsertSheetOpen");
    expect(editorPage).toContain("handleImageInsertSheetSelect");
    expect(editorPage).toContain("copy.editor.imageInsertSheetTitle");
    expect(editorPage).toContain("copy.value.editor.imageInsertFromAlbum");
    expect(editorPage).toContain("copy.value.editor.imageInsertFromCamera");
    expect(i18n).toContain("imageInsertSheetTitle");
    expect(i18n).toContain("imageInsertFromAlbum");
    expect(i18n).toContain("imageInsertFromCamera");
  });
});
