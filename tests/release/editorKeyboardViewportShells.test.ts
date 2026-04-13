import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor keyboard viewport shells", () => {
  it("gives diary editor a measured fixed layer and controlled interactive layer", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(diaryShell).toContain("diary-editor-shell__fixed-layer");
    expect(diaryShell).toContain("diary-editor-shell__interactive-layer");
    expect(diaryShell).toContain("keyboardHeight");
    expect(diaryShell).toContain("windowHeight");
    expect(diaryShell).toContain(":focus=\"textareaFocused\"");
    expect(diaryShell).toContain(":cursor=\"localCursorPosition\"");
    expect(diaryShell).toContain("focus-end-request");
    expect(diaryShell).toContain("content-selection-change");
    expect(diaryShell).toContain("diary-editor-shell__body-stage\" :style=\"bodyStageStyle\" @tap=\"handleEditorAreaFocus\"");
    expect(diaryShell).toContain("@tap.stop");
    expect(diaryShell).toContain("diary-editor-shell__inline-placeholder");
    expect(diaryShell).toContain(":placeholder=\"showInlinePlaceholder ? '' : bodyPlaceholder\"");
    expect(diaryShell).toContain("left: 0;");
    expect(diaryShell).not.toContain("left: calc(2em + 0.05em);");
    expect(diaryShell).toContain("const hasBodyInteracted = ref(false);");
    expect(diaryShell).toContain("const shouldLockCursorToEnd = ref(false);");
    expect(diaryShell).toContain("function focusEditorToEnd(): void");
    expect(diaryShell).toContain("requestAnimationFrame(releaseCursorLock)");
    expect(diaryShell).toContain("!hasBodyInteracted.value");
    expect(diaryShell).not.toContain("handleEditorAreaFocus(): void {\n  hasBodyInteracted.value = true;");
    expect(diaryShell).not.toContain("handleTextareaFocus(event: Event): void {\n  textareaFocused.value = true;\n  hasBodyInteracted.value = true;");
    expect(diaryShell).toContain(":focus=\"textareaFocused\"");
    expect(editorPage).toContain(":cursor-position=\"cursorPosition\"");
    expect(editorPage).toContain(":focus-end-request-key=\"focusEndRequestKey\"");
    expect(editorPage).toContain("requestBodyFocusIfNeeded");
  });

  it("gives jotting editor a measured fixed card head and controlled interactive layer", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(jottingShell).toContain("jotting-editor-shell__fixed-layer");
    expect(jottingShell).toContain("jotting-editor-shell__interactive-layer");
    expect(jottingShell).toContain("keyboardHeight");
    expect(jottingShell).toContain("windowHeight");
    expect(jottingShell).toContain("content-selection-change");
    expect(jottingShell).toContain("focus-end-request");
    expect(jottingShell).toContain("@tap=\"handleEditorAreaFocus\"");
    expect(jottingShell).toContain("@tap.stop");
    expect(jottingShell).toContain("jotting-editor-shell__inline-placeholder");
    expect(jottingShell).toContain(":placeholder=\"showInlinePlaceholder ? '' : bodyPlaceholder\"");
    expect(jottingShell).toContain("left: 0;");
    expect(jottingShell).not.toContain("left: calc(2em + 0.05em);");
    expect(jottingShell).toContain("const hasBodyInteracted = ref(false);");
    expect(jottingShell).toContain("!hasBodyInteracted.value");
    expect(jottingShell).not.toContain("handleEditorAreaFocus(): void {\n  if (props.mode !== \"edit\") {\n    return;\n  }\n\n  hasBodyInteracted.value = true;");
    expect(jottingShell).not.toContain("handleTextareaFocus(event: Event): void {\n  textareaFocused.value = true;\n  hasBodyInteracted.value = true;");
    expect(editorPage).toContain("@focus-end-request=\"handleFocusEndRequest\"");
    expect(editorPage).toContain("@content-selection-change=\"handleContentSelectionChange\"");
  });
});
