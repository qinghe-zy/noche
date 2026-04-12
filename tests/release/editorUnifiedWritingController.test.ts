import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor unified writing controller", () => {
  it("routes all writing shells through the shared writing surface controller", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).toContain("useWritingSurfaceController");
    expect(jottingShell).toContain("useWritingSurfaceController");
    expect(futureShell).toContain("useWritingSurfaceController");
    expect(diaryShell).toContain("noche-writing-surface");
    expect(jottingShell).toContain("noche-writing-surface");
    expect(futureShell).toContain("noche-writing-surface");
  });

  it("applies the short-page scroll guard to diary prelude selection", () => {
    const preludePicker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");

    expect(preludePicker).toContain("useViewportContentFit");
    expect(preludePicker).toContain(":scroll-y=\"viewportScrollEnabled\"");
  });
});
