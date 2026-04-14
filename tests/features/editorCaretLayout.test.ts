import { describe, expect, it } from "vitest";
import {
  estimateEditorCaretLineBottom,
  estimateEditorContentHeight,
  resolveCaretAwareScrollTop,
  resolveTapCaretLineBottom,
} from "@/features/editor/editorCaretLayout";

describe("editor caret layout", () => {
  it("keeps a mid-document caret above the keyboard instead of aligning to the full content bottom", () => {
    const content = Array.from({ length: 12 }, (_, index) => `第${index + 1}段今天也写一点东西`).join("\n");
    const middleCursor = content.indexOf("第7段");
    const availableWidth = 220;
    const fontSizePx = 18;
    const lineHeightPx = 40;

    const caretBottom = estimateEditorCaretLineBottom({
      content,
      cursor: middleCursor,
      availableWidth,
      fontSizePx,
      lineHeightPx,
    });
    const contentBottom = estimateEditorContentHeight({
      content,
      availableWidth,
      fontSizePx,
      lineHeightPx,
    });

    expect(caretBottom).toBeLessThan(contentBottom);
    expect(resolveCaretAwareScrollTop({
      caretLineBottom: caretBottom,
      viewportHeight: 280,
      minLineGapToKeyboard: 40,
    })).toBeLessThan(resolveCaretAwareScrollTop({
      caretLineBottom: contentBottom,
      viewportHeight: 280,
      minLineGapToKeyboard: 40,
    }));
  });

  it("treats a trailing newline as a new caret line", () => {
    const caretBottom = estimateEditorCaretLineBottom({
      content: "今天记一笔\n",
      cursor: "今天记一笔\n".length,
      availableWidth: 260,
      fontSizePx: 18,
      lineHeightPx: 44,
    });

    expect(caretBottom).toBe(88);
  });

  it("can approximate the first tapped caret line from the tap position when focus reports a stale cursor", () => {
    expect(resolveTapCaretLineBottom({
      tapClientY: 420,
      viewportTop: 180,
      currentScrollTop: 120,
      lineHeightPx: 44,
    })).toBe(382);
  });
});
