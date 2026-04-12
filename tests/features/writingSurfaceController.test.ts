import { describe, expect, it } from "vitest";
import {
  estimateCaretLine,
  resolveUsableWritingViewport,
  resolveViewportScrollEnabled,
  resolveWritingScrollTarget,
  resolveWritingSurfaceExpansion,
  resolveWritingSurfaceProfile,
} from "@/features/editor/composables/writingSurfaceController.shared";

describe("writing surface controller", () => {
  it("extends the writing paper before the user reaches the bottom", () => {
    const profile = resolveWritingSurfaceProfile("diary");
    const expansion = resolveWritingSurfaceExpansion({
      contentHeight: 492,
      fallbackLineCount: 12,
      renderedLines: profile.baseLines,
      profile,
    });

    expect(expansion.contentLines).toBe(12);
    expect(expansion.targetLines).toBe(16);
    expect(expansion.nextRenderedLines).toBe(16);
    expect(expansion.targetHeight).toBe(profile.firstLineOffset + 16 * profile.linePitch);
  });

  it("does not shrink rendered paper lines during an active writing session", () => {
    const profile = resolveWritingSurfaceProfile("future");
    const expansion = resolveWritingSurfaceExpansion({
      contentHeight: 96,
      fallbackLineCount: 3,
      renderedLines: 17,
      profile,
    });

    expect(expansion.contentLines).toBe(3);
    expect(expansion.targetLines).toBe(profile.baseLines);
    expect(expansion.nextRenderedLines).toBe(17);
    expect(expansion.targetHeight).toBe(profile.firstLineOffset + 17 * profile.linePitch);
  });

  it("computes the keyboard-safe writable viewport height", () => {
    expect(resolveUsableWritingViewport({
      viewportHeight: 851,
      keyboardHeight: 318,
      safeAreaBottom: 0,
      footerReserve: 24,
    })).toBe(509);
  });

  it("anchors the caret back into the comfort zone instead of waiting for the bottom edge", () => {
    const profile = resolveWritingSurfaceProfile("jotting");
    const result = resolveWritingScrollTarget({
      caretTop: 640,
      currentScrollTop: 140,
      bodyViewportHeight: 520,
      contentHeight: 1200,
      profile,
    });

    expect(result.shouldScroll).toBe(true);
    expect(result.comfortZone).toBeCloseTo(145.6);
    expect(result.targetScrollTop).toBe(458);
  });

  it("skips scroll writes when the target delta is too small", () => {
    const profile = resolveWritingSurfaceProfile("diary");
    const result = resolveWritingScrollTarget({
      caretTop: 550,
      currentScrollTop: 370,
      bodyViewportHeight: 500,
      contentHeight: 1100,
      profile,
    });

    expect(result.shouldScroll).toBe(false);
    expect(result.targetScrollTop).toBe(370);
  });

  it("estimates caret line positions from cursor progress when wrapping is involved", () => {
    expect(estimateCaretLine({
      value: "moonlight on the desk",
      cursor: 10,
      totalLineCount: 4,
    })).toBe(2);
    expect(estimateCaretLine({
      value: "one\ntwo\nthree",
      cursor: 5,
      totalLineCount: 3,
    })).toBe(2);
  });

  it("disables body scrolling when the content still fits within the first screen", () => {
    expect(resolveViewportScrollEnabled({
      bodyViewportHeight: 520,
      contentHeight: 519,
    })).toBe(false);
    expect(resolveViewportScrollEnabled({
      bodyViewportHeight: 520,
      contentHeight: 560,
    })).toBe(true);
  });
});
