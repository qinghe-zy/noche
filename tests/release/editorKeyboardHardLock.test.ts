import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor keyboard hard lock", () => {
  it("keeps manual anchor scrolling and does not ask native cursor spacing to pan the page", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const controller = readProjectFile("src/features/editor/composables/useWritingSurfaceController.ts");

    expect(diaryShell).toContain("adjust-position=\"false\"");
    expect(jottingShell).toContain("adjust-position=\"false\"");
    expect(futureShell).toContain("adjust-position=\"false\"");
    expect(diaryShell).not.toContain("cursor-spacing");
    expect(jottingShell).not.toContain("cursor-spacing");
    expect(futureShell).not.toContain("cursor-spacing");
    expect(controller).toContain("resolveWritingScrollTarget");
  });
});
