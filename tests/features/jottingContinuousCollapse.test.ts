import { describe, expect, it } from "vitest";
import {
  estimateJottingTextWidth,
  interpolateJottingMetric,
  resolveJottingCollapseProgress,
  resolveJottingEffectiveCollapseScroll,
  resolveJottingProgressWindow,
  shouldKeepJottingExpanded,
} from "@/features/editor/jottingContinuousCollapse";

describe("jottingContinuousCollapse", () => {
  it("keeps short content expanded when content fits the viewport", () => {
    expect(shouldKeepJottingExpanded({
      contentHeight: 480,
      viewportHeight: 520,
    })).toBe(true);
  });

  it("keeps the shell expanded at the exact content-fit boundary", () => {
    expect(shouldKeepJottingExpanded({
      contentHeight: 520,
      viewportHeight: 520,
    })).toBe(true);
  });

  it("allows collapse when content exceeds the viewport", () => {
    expect(shouldKeepJottingExpanded({
      contentHeight: 521,
      viewportHeight: 520,
    })).toBe(false);
  });

  it("keeps the shell expanded while the viewport height is zero or negative", () => {
    expect(shouldKeepJottingExpanded({
      contentHeight: 521,
      viewportHeight: 0,
    })).toBe(true);

    expect(shouldKeepJottingExpanded({
      contentHeight: 521,
      viewportHeight: -20,
    })).toBe(true);
  });

  it("deducts keyboard avoidance before resolving effective collapse scroll", () => {
    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: 84,
      keyboardAvoidanceOffset: 36,
    })).toBe(48);
  });

  it("keeps effective collapse scroll clamped at zero when keyboard avoidance exceeds the total scroll", () => {
    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: 24,
      keyboardAvoidanceOffset: 36,
    })).toBe(0);
  });

  it("ignores negative keyboard avoidance offsets so they do not amplify collapse scroll", () => {
    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: 24,
      keyboardAvoidanceOffset: -12,
    })).toBe(24);
  });

  it("fails safe to zero effective collapse scroll for non-finite scroll inputs", () => {
    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: Number.NaN,
      keyboardAvoidanceOffset: 12,
    })).toBe(0);

    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: Number.POSITIVE_INFINITY,
      keyboardAvoidanceOffset: 12,
    })).toBe(0);

    expect(resolveJottingEffectiveCollapseScroll({
      totalScrollTop: 24,
      keyboardAvoidanceOffset: Number.POSITIVE_INFINITY,
    })).toBe(0);
  });

  it("pins collapse progress inside the configured interval", () => {
    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 84,
      collapseStart: 24,
      collapseDistance: 120,
    })).toBe(0.5);
  });

  it("clamps collapse progress before and after the configured interval", () => {
    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 12,
      collapseStart: 24,
      collapseDistance: 120,
    })).toBe(0);

    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 180,
      collapseStart: 24,
      collapseDistance: 120,
    })).toBe(1);
  });

  it("stays expanded-safe when the collapse distance is zero or negative", () => {
    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 120,
      collapseStart: 24,
      collapseDistance: 0,
    })).toBe(0);

    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 120,
      collapseStart: 24,
      collapseDistance: -32,
    })).toBe(0);
  });

  it("stays expanded-safe when collapse progress inputs are non-finite", () => {
    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: Number.POSITIVE_INFINITY,
      collapseStart: 24,
      collapseDistance: 120,
    })).toBe(0);

    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: 120,
      collapseStart: Number.POSITIVE_INFINITY,
      collapseDistance: 120,
    })).toBe(0);

    expect(resolveJottingCollapseProgress({
      effectiveCollapseScroll: Number.NaN,
      collapseStart: 24,
      collapseDistance: 120,
    })).toBe(0);
  });

  it("interpolates scalar metrics without overshooting", () => {
    expect(interpolateJottingMetric({
      progress: 0.5,
      from: 60,
      to: 28,
    })).toBe(44);
  });

  it("preserves full precision for fractional interpolation while still clamping progress", () => {
    expect(interpolateJottingMetric({
      progress: 1 / 3,
      from: 0,
      to: 1,
    })).toBe(1 / 3);

    expect(interpolateJottingMetric({
      progress: -0.5,
      from: 20,
      to: 60,
    })).toBe(20);

    expect(interpolateJottingMetric({
      progress: 1.5,
      from: 20,
      to: 60,
    })).toBe(60);
  });

  it("fails safe to finite metric outputs when progress or metrics are non-finite", () => {
    expect(interpolateJottingMetric({
      progress: Number.NaN,
      from: 20,
      to: 60,
    })).toBe(20);

    expect(interpolateJottingMetric({
      progress: Number.POSITIVE_INFINITY,
      from: 20,
      to: 60,
    })).toBe(60);
  });

  it("holds the known metric when only one interpolation side is finite", () => {
    expect(interpolateJottingMetric({
      progress: 0.5,
      from: Number.NaN,
      to: 88,
    })).toBe(88);

    expect(interpolateJottingMetric({
      progress: 0.5,
      from: 260,
      to: Number.NaN,
    })).toBe(260);
  });

  it("keeps the late clipping phase closed before the configured threshold", () => {
    expect(resolveJottingProgressWindow({
      progress: 0.55,
      start: 0.6,
      end: 1,
    })).toBe(0);
  });

  it("maps the late clipping phase onto a normalized 0-1 window", () => {
    expect(resolveJottingProgressWindow({
      progress: 0.8,
      start: 0.6,
      end: 1,
    })).toBeCloseTo(0.5);
  });

  it("clamps the late clipping phase after the configured threshold", () => {
    expect(resolveJottingProgressWindow({
      progress: 1.2,
      start: 0.6,
      end: 1,
    })).toBe(1);
  });

  it("fails safe when the progress window is non-finite or inverted", () => {
    expect(resolveJottingProgressWindow({
      progress: Number.NaN,
      start: 0.6,
      end: 1,
    })).toBe(0);

    expect(resolveJottingProgressWindow({
      progress: 0.9,
      start: Number.NaN,
      end: 1,
    })).toBe(0);

    expect(resolveJottingProgressWindow({
      progress: 0.9,
      start: 0.8,
      end: 0.6,
    })).toBe(0);
  });

  it("estimates empty text as zero width", () => {
    expect(estimateJottingTextWidth("", 26)).toBe(0);
  });

  it("scales width estimation with font size", () => {
    expect(estimateJottingTextWidth("4月18日", 52)).toBeGreaterThan(
      estimateJottingTextWidth("4月18日", 26),
    );
  });

  it("gives Latin month abbreviations a stable finite width", () => {
    const width = estimateJottingTextWidth("Apr 18", 26);
    expect(width).toBeGreaterThan(0);
    expect(Number.isFinite(width)).toBe(true);
  });
});
