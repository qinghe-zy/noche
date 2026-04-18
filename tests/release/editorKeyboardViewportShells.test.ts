import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("editor keyboard viewport shells", () => {
  it("gives diary editor the same collapsing read and edit shell pattern while freezing collapse during keyboard editing", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(diaryShell).toContain("useDeferredKeyboardViewportSync");
    expect(diaryShell).toContain("diary-shell-read__scroll");
    expect(diaryShell).toContain("diary-shell-read__overlay");
    expect(diaryShell).toContain("@scroll=\"onReadScroll\"");
    expect(diaryShell).toContain("diary-shell-edit__scroll");
    expect(diaryShell).toContain("diary-shell-edit__overlay");
    expect(diaryShell).toContain("resolveJottingCollapseProgress");
    expect(diaryShell).toContain("const isEditShellScrollLocked = computed(() => keyboardVisible.value);");
    expect(diaryShell).toContain(":scroll-y=\"!isEditShellScrollLocked && editCanShellScroll\"");
    expect(diaryShell).toContain("editCollapseProgress.value = resolveJottingCollapseProgress({");
    expect(diaryShell).toContain("if (!isEditShellScrollLocked.value) {");
    expect(diaryShell).toContain("visibleWindowHeight");
    expect(diaryShell).toContain("resolveInteractiveLayerHeight");
    expect(diaryShell).not.toContain("diary-editor-shell__fixed-layer");
    expect(diaryShell).not.toContain("diary-editor-shell__interactive-layer");
    expect(diaryShell).not.toContain("windowHeight.value - fixedLayerHeight.value - (keyboardVisible.value ? keyboardHeight.value : 0)");
    expect(diaryShell).not.toContain("useEditorKeyboardViewport(");
    expect(diaryShell).toContain(":focus=\"textareaFocused\"");
    expect(diaryShell).toContain(":cursor=\"localCursorPosition\"");
    expect(diaryShell).toContain("focus-end-request");
    expect(diaryShell).toContain("content-selection-change");
    expect(diaryShell).toContain("@tap.stop");
    expect(diaryShell).toContain("diary-shell-edit__blank-spacer");
    expect(diaryShell).toContain("@tap=\"handleBlankAreaFocus\"");
    expect(diaryShell).not.toContain("diary-shell-edit__body\" :style=\"editBodyStyle\" @tap=\"handleEditorAreaFocus\"");
    expect(diaryShell).toContain("diary-editor-shell__inline-placeholder");
    expect(diaryShell).toContain(":placeholder=\"showInlinePlaceholder ? '' : bodyPlaceholder\"");
    expect(diaryShell).toContain("left: 0;");
    expect(diaryShell).not.toContain("left: calc(2em + 0.05em);");
    expect(diaryShell).toContain("const hasBodyInteracted = ref(false);");
    expect(diaryShell).toContain("const shouldLockCursorToEnd = ref(false);");
    expect(diaryShell).toContain("function focusEditorToEnd(): void");
    expect(diaryShell).toContain("function handleBlankAreaFocus(): void");
    expect(diaryShell).not.toContain("function handleEditorAreaFocus(): void");
    expect(diaryShell).toContain("requestAnimationFrame(releaseCursorLock)");
    expect(diaryShell).toContain("!hasBodyInteracted.value");
    expect(diaryShell).not.toContain("diary-editor-shell__topbar-center literary-text");
    expect(diaryShell).not.toContain("handleEditorAreaFocus(): void {\n  hasBodyInteracted.value = true;");
    expect(diaryShell).not.toContain("handleTextareaFocus(event: Event): void {\n  textareaFocused.value = true;\n  hasBodyInteracted.value = true;");
    expect(diaryShell).toContain("requestKeyboardViewportSync");
    expect(diaryShell).toContain("flushPendingKeyboardViewportSync");
    expect(diaryShell).toContain(":focus=\"textareaFocused\"");
    expect(editorPage).toContain(":visible-window-height=\"visibleWindowHeight\"");
    expect(editorPage).toContain(":cursor-position=\"cursorPosition\"");
    expect(editorPage).toContain(":focus-end-request-key=\"focusEndRequestKey\"");
    expect(editorPage).toContain("requestBodyFocusIfNeeded");
  });

  it("gives jotting editor a full-page edit shell and keeps shell scrolling manual while keyboard focus only freezes collapse", () => {
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(jottingShell).toContain("useDeferredKeyboardViewportSync");
    expect(jottingShell).toContain("jotting-shell-edit__scroll");
    expect(jottingShell).toContain("jotting-shell-edit__paper");
    expect(jottingShell).toContain("jotting-shell-edit__overlay");
    expect(jottingShell).toContain("visibleWindowHeight");
    expect(jottingShell).toContain("resolveInteractiveLayerHeight");
    expect(jottingShell).not.toContain("windowHeight.value - shellFixedHeight.value - (keyboardVisible.value ? keyboardHeight.value : 0)");
    expect(jottingShell).not.toContain("useEditorKeyboardViewport(");
    expect(jottingShell).toContain("content-selection-change");
    expect(jottingShell).toContain("focus-end-request");
    expect(jottingShell).toContain("@tap.stop");
    expect(jottingShell).toContain("jotting-shell-edit__blank-spacer");
    expect(jottingShell).toContain("@tap=\"handleBlankAreaFocus\"");
    expect(jottingShell).not.toContain("jotting-shell-edit__body\" :style=\"editBodyStyle\" @tap=\"handleEditorAreaFocus\"");
    expect(jottingShell).toContain("jotting-editor-shell__inline-placeholder");
    expect(jottingShell).toContain(":placeholder=\"showInlinePlaceholder ? '' : bodyPlaceholder\"");
    expect(jottingShell).toContain("left: 0;");
    expect(jottingShell).not.toContain("left: calc(2em + 0.05em);");
    expect(jottingShell).toContain("const hasBodyInteracted = ref(false);");
    expect(jottingShell).toContain("!hasBodyInteracted.value");
    expect(jottingShell).toContain("const editUserScrollTop = ref(0);");
    expect(jottingShell).toContain("const isEditShellScrollLocked = computed(() => keyboardVisible.value);");
    expect(jottingShell).toContain("const isProgrammaticEditBodyScroll = ref(false);");
    expect(jottingShell).toContain("measureEditBodyViewport");
    expect(jottingShell).toContain("const editScrollTopBinding = computed(() =>");
    expect(jottingShell).toContain("jotting-shell-edit__body");
    expect(jottingShell).toContain(":scroll-y=\"!isEditShellScrollLocked && editCanShellScroll\"");
    expect(jottingShell).not.toContain("jotting-shell-edit__body-scroll");
    expect(jottingShell).not.toContain("handleEditorAreaFocus(): void {\n  if (props.mode !== \"edit\") {\n    return;\n  }\n\n  hasBodyInteracted.value = true;");
    expect(jottingShell).not.toContain("handleTextareaFocus(event: Event): void {\n  textareaFocused.value = true;\n  hasBodyInteracted.value = true;");
    expect(jottingShell).toContain("function handleBlankAreaFocus(): void");
    expect(jottingShell).not.toContain("function handleEditorAreaFocus(): void");
    expect(jottingShell).toContain("requestKeyboardViewportSync");
    expect(jottingShell).toContain("flushPendingKeyboardViewportSync");
    expect(editorPage).toContain(":visible-window-height=\"visibleWindowHeight\"");
    expect(editorPage).toContain("@focus-end-request=\"handleFocusEndRequest\"");
    expect(editorPage).toContain("@content-selection-change=\"handleContentSelectionChange\"");
  });
});
