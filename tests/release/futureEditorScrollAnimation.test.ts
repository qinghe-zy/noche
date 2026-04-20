import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("future editor scroll animation", () => {
  it("does not keep scroll animation permanently enabled during normal typing", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain(":scroll-with-animation=\"scrollWithAnimation\"");
    expect(futureShell).toContain("const scrollWithAnimation = ref(false);");
    expect(futureShell).not.toContain(":style=\"interactiveLayerStyle\"");
    expect(futureShell).not.toContain("const interactiveLayerStyle = computed(() => ({");
    expect(futureShell).toContain("const isProgrammaticWritingScroll = ref(false);");
    expect(futureShell).toContain("const programmaticWritingScrollTop = ref<number | null>(null);");
    expect(futureShell).toContain("const writingScrollTopBinding = computed(() => programmaticWritingScrollTop.value);");
    expect(futureShell).toContain(":scroll-top=\"writingScrollTopBinding\"");
    expect(futureShell).not.toContain(":scroll-top=\"writingScrollTop\"");
    expect(futureShell).not.toContain("const writingScrollTopBinding = computed(() => programmaticWritingScrollTop.value ?? writingScrollTop.value);");
    expect(futureShell).not.toContain("scroll-with-animation\n");
    expect(futureShell).not.toContain("programmaticWritingScrollTop.value = undefined;");
    expect(futureShell).toContain("programmaticWritingScrollTop.value = null;");
  });

  it("separates keyboard-transition scrolling from input-time scrolling", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("useDeferredKeyboardViewportSync");
    expect(futureShell).toContain("resolveFutureScrollViewportHeight");
    expect(futureShell).toContain("shouldApplyFuturePropCursorSync");
    expect(futureShell).toContain("shouldPreserveFutureCaretAnchor");
    expect(futureShell).toContain("const caretAnchorCursorPosition = ref(props.cursorPosition);");
    expect(futureShell).toContain("watch(\n  () => [props.keyboardVisible, props.visibleWindowHeight]");
    expect(futureShell).toContain("syncWritingScroll(");
    expect(futureShell).toContain("@scroll=\"handleWritingScroll\"");
    expect(futureShell).toContain("function handleWritingScroll(event: Event): void");
    expect(futureShell).toContain("writingScrollTop.value = Math.max(detail?.scrollTop ?? 0, 0);");
    expect(futureShell).not.toContain("if (!isProgrammaticWritingScroll.value) {\n    programmaticWritingScrollTop.value = undefined;\n  }");
    expect(futureShell).toContain("scrollWithAnimation.value = false;");
    expect(futureShell).toContain("if (nextKeyboardVisible) {");
    expect(futureShell).toContain("requestKeyboardViewportSync();\n        return;");
    expect(futureShell).not.toContain("setProgrammaticWritingScrollTop(writingScrollTop.value);");
    expect(futureShell).not.toContain("viewportHeight: Math.max(bodyViewportHeight.value, interactiveLayerHeight.value),");
    expect(futureShell).not.toContain("if (visible) {\n      scrollWithAnimation.value = false;\n      requestKeyboardViewportSync(measuredContentHeight.value, {\n        force: true,");
    expect(futureShell).not.toContain("if (props.keyboardVisible) {\n      scrollWithAnimation.value = false;\n      requestKeyboardViewportSync(measuredContentHeight.value, {\n        force: true,");
    expect(futureShell).not.toContain("nextTick(() => {\n      scrollWithAnimation.value = false;\n      syncWritingScroll(measuredContentHeight.value, {\n        force: true,");
    expect(futureShell).not.toContain("allowRestore");
    expect(futureShell).not.toContain("nextContentHeight - interactiveLayerHeight.value + props.restoreAfterKeyboardHide");
    expect(futureShell).not.toContain(".editor-page__interactive-layer { position: relative; z-index: 1; min-height: 0; transition: height 220ms ease-out; }");
    expect(futureShell).not.toContain("if (props.keyboardVisible && estimatedHeight !== previousMeasuredHeight) {\n    syncWritingScroll(");
  });

  it("keeps future letter native caret taps while deferring keyboard-open scroll until the viewport is measured", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain("editor-page__blank-spacer");
    expect(futureShell).toContain("@tap=\"handleBlankAreaFocus\"");
    expect(futureShell).toContain("function handleBlankAreaFocus(): void");
    expect(futureShell).toContain("emit(\"focus-end-request\")");
    expect(futureShell).not.toContain("@tap=\"handleEditorAreaFocus\"");
    expect(futureShell).not.toContain("function handleEditorAreaFocus(): void");
    expect(futureShell).toContain("const bodyViewportHeight = ref(0);");
    expect(futureShell).toContain("requestKeyboardViewportSync");
    expect(futureShell).toContain("flushPendingKeyboardViewportSync");
    expect(futureShell).toContain("function measureLayout(onComplete?: () => void): void");
    expect(futureShell).toContain("measureLayout(() => {\n      flush();\n    });");
    expect(futureShell).toContain("watch(bodyViewportHeight, (nextHeight) => {\n  if (nextHeight <= 0) {\n    return;\n  }\n\n  flushPendingKeyboardViewportSync();\n});");
    expect(futureShell).toContain("cursor: caretAnchorCursorPosition.value,");
    expect(futureShell).toContain("if (!shouldApplyFuturePropCursorSync({");
    expect(futureShell).toContain("shouldPreserveFutureCaretAnchor({");
    expect(futureShell).toContain("const cursor = typeof detail?.cursor === \"number\" ? detail.cursor : localCursorPosition.value;");
    expect(futureShell).not.toContain("const cursor = typeof detail?.cursor === \"number\" ? detail.cursor : props.cursorPosition;");
    expect(futureShell).not.toContain("if (props.keyboardVisible && textareaFocused.value) {\n      requestKeyboardViewportSync();\n    }");
    expect(futureShell).not.toContain("if (props.keyboardVisible) {\n    nextTick(() => {\n      syncWritingScroll();\n    });\n  }");
    expect(futureShell).not.toContain("if (props.keyboardVisible && textareaFocused.value) {\n      nextTick(() => {\n        syncWritingScroll();\n      });\n    }");
  });

  it("keeps future editor safe spacing tied to the active writing line height", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");

    expect(editorPage).toContain("resolveEditorLiveSpacing");
    expect(editorPage).toContain("Math.max(minLineGapToKeyboard.value, writingAppearance.value.lineHeightPx)");
    expect(editorPage).toContain("Math.max(cursorSpacing.value, writingAppearance.value.lineHeightPx)");
  });
});
