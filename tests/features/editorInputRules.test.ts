import { describe, expect, it } from "vitest";
import {
  isEditorContentVisuallyEmpty,
  normalizeEditorInput,
  resolveEditorInitialContent,
} from "@/features/editor/editorInputRules";

describe("editor input rules", () => {
  it("keeps diary and jotting drafts visually empty on first open instead of pre-filling full-width indent", () => {
    expect(resolveEditorInitialContent("diary", "")).toBe("");
    expect(resolveEditorInitialContent("jotting", "")).toBe("");
    expect(resolveEditorInitialContent("future", "")).toBe("");
  });

  it("adds the first-line full-width indent only after the user actually starts typing", () => {
    const result = normalizeEditorInput({
      entryType: "diary",
      previousValue: "",
      nextValue: "今",
      cursor: 1,
    });

    expect(result.value).toBe("　　今");
    expect(result.cursor).toBe(3);
  });

  it("keeps the future letter first line flush-left but indents new lines", () => {
    const result = normalizeEditorInput({
      entryType: "future",
      previousValue: "写给未来",
      nextValue: "写给未来\n明天见",
      cursor: 6,
    });

    expect(result.value).toBe("写给未来\n　　明天见");
    expect(result.cursor).toBe(8);
  });

  it("does not reapply indentation after a user manually deletes it", () => {
    const result = normalizeEditorInput({
      entryType: "diary",
      previousValue: "　　今天很好",
      nextValue: "今天很好",
      cursor: 4,
    });

    expect(result.value).toBe("今天很好");
    expect(result.cursor).toBe(4);
  });

  it("treats indent-only diary and jotting content as visually empty so inline hints can stay visible", () => {
    expect(isEditorContentVisuallyEmpty("diary", "")).toBe(true);
    expect(isEditorContentVisuallyEmpty("jotting", "")).toBe(true);
    expect(isEditorContentVisuallyEmpty("diary", "　　")).toBe(true);
    expect(isEditorContentVisuallyEmpty("jotting", "　　")).toBe(true);
    expect(isEditorContentVisuallyEmpty("future", "")).toBe(true);
    expect(isEditorContentVisuallyEmpty("diary", "　　今天开始写")).toBe(false);
  });
});
