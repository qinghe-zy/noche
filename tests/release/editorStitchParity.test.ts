import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8").replace(/\r\n/g, "\n");
}

describe("editor stitch parity", () => {
  it("keeps the immersive stationery scaffold", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("editor-page__topbar");
    expect(editorPage).toContain("editor-page__paper-surface");
    expect(editorPage).toContain("editor-page__writing-lines");
    expect(editorPage).toContain("editor-page__writing-area");
  });

  it("uses local editor icons instead of remote font ligatures", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("AppIcon");
    expect(editorPage).toContain("TopbarIconButton");
    expect(editorPage).not.toContain("fonts.googleapis.com");
  });

  it("uses 18px body text for writing and reading on stationery pages", () => {
    const editorPage = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(editorPage).toContain("--editor-writing-font-size");
    expect(editorPage).toContain("--editor-writing-line-height");
  });

  it("keeps editor shells local-first and does not rely on remote font cdn imports", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).not.toContain("fonts.googleapis.com");
    expect(jottingShell).not.toContain("fonts.googleapis.com");
    expect(futureShell).not.toContain("fonts.googleapis.com");
  });

  it("prevents keyboard focus from pushing the whole writing page upward", () => {
    const editorPage = readProjectFile("src/features/editor/pages/EditorPage.vue");
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(diaryShell).toContain("adjust-position=\"false\"");
    expect(jottingShell).toContain("adjust-position=\"false\"");
    expect(futureShell).toContain("adjust-position=\"false\"");
    expect(futureShell).toContain("editor-page__fixed-layer");
    expect(futureShell).toContain("editor-page__interactive-layer");
    expect(editorPage).toContain(":visible-window-height=\"visibleWindowHeight\"");
    expect(editorPage).toContain("@pick-images=\"handlePickImages\"");
    expect(futureShell).toContain("editor-page__meta-image-button");
    expect(futureShell).not.toContain("auto-height");
  });

  it("keeps the future letter shell full-screen and immersive instead of a centered white card", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain(".editor-page__canvas { padding: 0;");
    expect(futureShell).toContain("max-width: none;");
    expect(futureShell).toContain("height: 100vh;");
    expect(futureShell).toContain("box-shadow: none;");
    expect(futureShell).toContain("border: none;");
  });

  it("isolates the future letter's Claude-dark overrides behind the Claude family instead of mutating every dark theme", () => {
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");

    expect(futureShell).toContain(".theme-family-claude.theme-key-claude-dark.editor-page");
    expect(futureShell).toContain(".theme-family-claude.theme-key-claude-dark .editor-page__paper-surface");
    expect(futureShell).toContain(".theme-family-claude.theme-key-claude-dark .editor-page__future-ribbon");
    expect(futureShell).not.toContain(".theme-dark .editor-page__paper-surface");
  });

  it("starts moving editor shells onto semantic tokens and heading/body font stacks", () => {
    const diaryShell = readProjectFile("src/features/editor/components/DiaryEditorShell.vue");
    const jottingShell = readProjectFile("src/features/editor/components/JottingEditorShell.vue");
    const futureShell = readProjectFile("src/features/editor/components/FutureLetterEditorShell.vue");
    const preludePicker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");

    expect(diaryShell).toContain("var(--font-heading)");
    expect(jottingShell).toContain("var(--font-body)");
    expect(futureShell).toContain("var(--surface-primary");
    expect(futureShell).toContain("var(--text-secondary");
    expect(diaryShell).toContain("var(--button-topbar-text");
    expect(diaryShell).toContain("var(--button-pill-bg");
    expect(jottingShell).toContain("var(--button-topbar-text");
    expect(jottingShell).toContain("var(--button-pill-bg");
    expect(preludePicker).toContain("var(--button-pill-bg");
    expect(preludePicker).toContain("var(--button-option-bg");
    expect(preludePicker).toContain("var(--button-option-active-bg");
    expect(preludePicker).toContain("var(--button-primary-bg");
  });
});
