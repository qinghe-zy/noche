import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("future date picker polish", () => {
  it("uses an in-app calendar picker instead of the raw native date input", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(futureShell).not.toContain('type="date"');
    expect(futureShell).toContain("editor-page__date-grid");
    expect(futureShell).toContain("editor-page__date-chip");
    expect(editorPage).toContain("futurePickerDays");
    expect(editorPage).toContain("handlePickFutureDate");
  });
});
