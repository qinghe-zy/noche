import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor caret scroll parity", () => {
  it("uses caret-aware scroll helpers across all editor shells", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).toContain("estimateEditorCaretLineBottom");
    expect(diaryShell).toContain("resolveCaretAwareScrollTop");
    expect(diaryShell).toContain("handleTextareaTap");
    expect(diaryShell).toContain("resolveTapCaretLineBottom");
    expect(jottingShell).toContain("estimateEditorCaretLineBottom");
    expect(jottingShell).toContain("resolveCaretAwareScrollTop");
    expect(jottingShell).toContain("handleTextareaTap");
    expect(jottingShell).toContain("resolveTapCaretLineBottom");
    expect(futureShell).toContain("estimateEditorCaretLineBottom");
    expect(futureShell).toContain("resolveCaretAwareScrollTop");
    expect(futureShell).toContain("handleTextareaTap");
    expect(futureShell).toContain("resolveTapCaretLineBottom");
  });
});
