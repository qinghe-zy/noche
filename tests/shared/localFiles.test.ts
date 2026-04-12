import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { normalizeLocalImageSrc } from "@/shared/utils/localFiles";

describe("local file image normalization", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("converts app-plus _doc image paths into renderable file urls", () => {
    vi.stubGlobal("plus", {
      io: {
        convertLocalFileSystemURL: (path: string) => `/storage/emulated/0/Android/data/com.qinghezy.jiyu/${path.replace(/^_doc\//, "")}`,
      },
    });

    expect(normalizeLocalImageSrc("_doc/noche/image-1.png")).toBe(
      "file:///storage/emulated/0/Android/data/com.qinghezy.jiyu/noche/image-1.png",
    );
  });

  it("keeps file urls and data urls unchanged", () => {
    expect(normalizeLocalImageSrc("file:///storage/emulated/0/DCIM/image.png")).toBe(
      "file:///storage/emulated/0/DCIM/image.png",
    );
    expect(normalizeLocalImageSrc("data:image/png;base64,abc")).toBe("data:image/png;base64,abc");
  });
});
