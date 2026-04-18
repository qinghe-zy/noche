import { describe, expect, it } from "vitest";
import {
  reconcileFutureMeasuredHeight,
  resolveEditorLiveSpacing,
  resolveFutureScrollViewportHeight,
  shouldApplyFuturePropCursorSync,
  shouldPreserveFutureCaretAnchor,
} from "@/features/editor/futureEditorLayout";

describe("future editor layout helpers", () => {
  it("keeps keyboard spacing at least as tall as the active writing line", () => {
    expect(resolveEditorLiveSpacing(44, 40)).toBe(44);
    expect(resolveEditorLiveSpacing(44, 48)).toBe(48);
  });

  it("trusts the real measured height when growth overshoots the visual estimate", () => {
    expect(reconcileFutureMeasuredHeight({
      estimatedHeight: 440,
      actualHeight: 396,
      currentMeasuredHeight: 352,
      lastContentChangeDirection: "grow",
      lineHeightPx: 44,
    })).toBe(396);
  });

  it("keeps the current height when shrink reports a stale taller measurement", () => {
    expect(reconcileFutureMeasuredHeight({
      estimatedHeight: 352,
      actualHeight: 440,
      currentMeasuredHeight: 396,
      lastContentChangeDirection: "shrink",
      lineHeightPx: 44,
    })).toBe(396);
  });

  it("prefers the measured writing viewport height when keyboard scroll sync has a real body viewport", () => {
    expect(resolveFutureScrollViewportHeight(236, 312)).toBe(236);
    expect(resolveFutureScrollViewportHeight(0, 312)).toBe(312);
  });

  it("preserves the current caret anchor only during a pending keyboard viewport sync", () => {
    expect(shouldPreserveFutureCaretAnchor({
      keyboardVisible: true,
      textareaFocused: true,
      pendingKeyboardViewportSync: true,
    })).toBe(true);

    expect(shouldPreserveFutureCaretAnchor({
      keyboardVisible: true,
      textareaFocused: true,
      pendingKeyboardViewportSync: false,
    })).toBe(false);
  });

  it("ignores parent cursor echo while the future editor is already focused with the keyboard open", () => {
    expect(shouldApplyFuturePropCursorSync({
      keyboardVisible: true,
      textareaFocused: true,
    })).toBe(false);

    expect(shouldApplyFuturePropCursorSync({
      keyboardVisible: false,
      textareaFocused: true,
    })).toBe(true);

    expect(shouldApplyFuturePropCursorSync({
      keyboardVisible: true,
      textareaFocused: false,
    })).toBe(true);
  });
});
