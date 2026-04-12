import { describe, expect, it } from "vitest";
import {
  applyMobileLayoutVars,
  computeMobileLayoutMetrics,
  rpxToPx,
} from "@/shared/layout/mobileLayout";

describe("mobile layout baseline", () => {
  it("keeps a stable viewport height once the larger real viewport is known", () => {
    const metrics = computeMobileLayoutMetrics(
      {
        windowWidth: 393,
        windowHeight: 851,
        screenHeight: 851,
        statusBarHeight: 32,
        safeAreaInsets: {
          top: 32,
          bottom: 0,
        },
      },
      0,
    );
    const keyboardViewportMetrics = computeMobileLayoutMetrics(
      {
        windowWidth: 393,
        windowHeight: 602,
        screenHeight: 851,
        statusBarHeight: 32,
        safeAreaInsets: {
          top: 32,
          bottom: 0,
        },
      },
      metrics.viewportHeight,
    );

    expect(metrics.viewportHeight).toBe(851);
    expect(keyboardViewportMetrics.viewportHeight).toBe(851);
    expect(keyboardViewportMetrics.safeTop).toBe(32);
    expect(keyboardViewportMetrics.statusBarHeight).toBe(32);
    expect(keyboardViewportMetrics.navBarHeight).toBe(44);
    expect(keyboardViewportMetrics.pageTopInset).toBe(76);
    expect(keyboardViewportMetrics.contentMinHeight).toBe(775);
  });

  it("maps shared spacing tokens into css variables", () => {
    const setCalls: Array<[string, string]> = [];
    const metrics = computeMobileLayoutMetrics({
      windowWidth: 393,
      windowHeight: 851,
      statusBarHeight: 32,
      safeAreaInsets: {
        top: 32,
        bottom: 0,
      },
    });

    applyMobileLayoutVars(
      {
        setProperty(name: string, value: string) {
          setCalls.push([name, value]);
        },
      },
      metrics,
    );

    expect(setCalls).toContainEqual(["--noche-safe-top", "32px"]);
    expect(setCalls).toContainEqual(["--noche-status-bar-height", "32px"]);
    expect(setCalls).toContainEqual(["--noche-nav-bar-height", "44px"]);
    expect(setCalls).toContainEqual(["--noche-page-top-inset", `${metrics.pageTopInset}px`]);
    expect(setCalls).toContainEqual(["--noche-content-min-height", `${metrics.contentMinHeight}px`]);
    expect(setCalls).toContainEqual(["--noche-viewport-height", "851px"]);
    expect(setCalls).toContainEqual(["--noche-page-padding-x", `${rpxToPx(28, 393)}px`]);
    expect(setCalls).toContainEqual(["--noche-editor-textarea-min-height", `${metrics.editorTextareaMinHeight}px`]);
  });
});
