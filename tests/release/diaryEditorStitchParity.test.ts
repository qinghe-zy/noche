import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("diary editor stitch parity", () => {
  it("uses a dedicated diary shell instead of the future stationery page", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");

    expect(diaryShell).toContain("diary-editor-shell");
    expect(diaryShell).toContain("AppIcon name=\"image\"");
    expect(diaryShell).toContain("TopbarIconButton");
    expect(diaryShell).not.toContain("diary-editor-shell__inkwell");
    expect(diaryShell).not.toContain("AppIcon name=\"palette\"");
    expect(diaryShell).toContain("handlePickImagesTrigger");
    expect(diaryShell).toContain("@click=\"handlePickImagesTrigger\"");
  });
});
