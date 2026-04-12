import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("local image render parity", () => {
  it("routes editor attachment surfaces through a shared local image src normalizer", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).toContain("normalizeLocalImageSrc");
    expect(jottingShell).toContain("normalizeLocalImageSrc");
    expect(futureShell).toContain("normalizeLocalImageSrc");
  });

  it("routes profile album thumbnail and viewer surfaces through the same local image src normalizer", () => {
    const album = readProjectFile("src/features/profile/components/ProfileMemoryAlbum.vue");
    const viewer = readProjectFile("src/features/profile/components/ProfileAlbumViewer.vue");

    expect(album).toContain("normalizeLocalImageSrc(item.localUri)");
    expect(viewer).toContain("normalizeLocalImageSrc(item.localUri)");
  });
});
