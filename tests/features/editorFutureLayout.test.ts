import { describe, expect, it } from "vitest";
import {
  reconcileFutureMeasuredHeight,
  resolveEditorLiveSpacing,
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
});
