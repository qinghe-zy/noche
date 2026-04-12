import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEditorImagePicker } from "@/features/editor/composables/useEditorImagePicker";

describe("editor image picker", () => {
  const chooseImage = vi.fn();
  const saveFile = vi.fn();
  const getImageInfo = vi.fn();

  beforeEach(() => {
    chooseImage.mockImplementation(({ success }: { success?: (result: unknown) => void }) => {
      success?.({
        tempFilePaths: ["/tmp/paper.png"],
        tempFiles: [{ path: "/tmp/paper.png" }],
      });
    });
    saveFile.mockImplementation(({ success }: { success?: (result: unknown) => void }) => {
      success?.({ savedFilePath: "_doc/paper.png" });
    });
    getImageInfo.mockImplementation(({ success }: { success?: (result: unknown) => void }) => {
      success?.({ width: 1200, height: 900 });
    });

    vi.stubGlobal("uni", {
      chooseImage,
      saveFile,
      getImageInfo,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("passes the requested source type into uni.chooseImage", async () => {
    const picker = useEditorImagePicker();

    const attachments = await picker.pickImages({
      draftKey: "draft-image-sheet",
      sourceType: ["camera"],
    });

    expect(chooseImage).toHaveBeenCalledWith(expect.objectContaining({
      sourceType: ["camera"],
    }));
    expect(attachments).toHaveLength(1);
    expect(attachments[0]?.localUri).toBe("_doc/paper.png");
  });
});
