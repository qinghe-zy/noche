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

  it("does not expose unlock-date controls on the initial future draft before save requests a date", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(futureShell).toContain("v-if=\"showFutureUnlockRibbon\"");
    expect(futureShell).not.toContain("v-if=\"mode === 'edit'\" class=\"editor-page__future-ribbon\"");
    expect(editorPage).toContain(":show-future-unlock-ribbon=\"showFutureUnlockRibbon\"");
    expect(editorPage).toContain("const showFutureUnlockRibbon = computed(() =>");
    expect(editorPage).toContain("entryType.value === \"future\"");
    expect(editorPage).toContain("mode.value === \"edit\"");
    expect(editorPage).toContain("Boolean(unlockDate.value)");
  });
});
