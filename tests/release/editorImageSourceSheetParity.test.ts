import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor image source sheet parity", () => {
  it("routes image picking through the shared paper option sheet instead of directly surfacing a mixed native source picker", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");
    const imagePicker = readProjectFile("src/features/editor/composables/useEditorImagePicker.ts");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(editorPage).toContain("PaperOptionSheet");
    expect(editorPage).toContain("isImageSourceSheetOpen");
    expect(editorPage).toContain("imageSourceTitle");
    expect(editorPage).toContain("imageFromAlbum");
    expect(editorPage).toContain("imageFromCamera");
    expect(editorPage).toContain("handleImageSourceSelect");
    expect(imagePicker).toContain("sourceType: [sourceType]");
    expect(i18n).toContain('imageSourceTitle: "添加图片"');
    expect(i18n).toContain('imageFromAlbum: "从相册添加"');
    expect(i18n).toContain('imageFromCamera: "拍一张"');
  });
});
