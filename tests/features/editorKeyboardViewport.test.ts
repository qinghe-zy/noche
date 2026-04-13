import { describe, expect, it } from "vitest";
import {
  DEFAULT_EDITOR_LINE_HEIGHT_PX,
  createEditorViewportSnapshot,
  shouldRefreshForNextLine,
} from "@/features/editor/composables/useEditorKeyboardViewport";

describe("editor keyboard viewport", () => {
  it("derives status bar, safe area, topbar, and attachment offsets from system metrics", () => {
    const snapshot = createEditorViewportSnapshot({
      safeArea: {
        left: 0,
        right: 375,
        top: 44,
        bottom: 778,
        width: 375,
        height: 734,
      },
      screenHeight: 812,
      screenWidth: 375,
      statusBarHeight: 28,
      windowHeight: 812,
      keyboardHeight: 320,
      keyboardVisible: true,
    });

    expect(snapshot.statusBarHeight).toBe(28);
    expect(snapshot.safeAreaBottom).toBe(34);
    expect(snapshot.topbarTop).toBe(44);
    expect(snapshot.topbarHorizontalPadding).toBe(16);
    expect(snapshot.topbarBottomSpacing).toBe(12);
    expect(snapshot.attachmentDockBottom).toBe(332);
    expect(snapshot.cursorSpacing).toBe(DEFAULT_EDITOR_LINE_HEIGHT_PX);
  });

  it("requests a one-line refresh when the next line would press into the keyboard buffer", () => {
    expect(shouldRefreshForNextLine({
      contentHeight: 480,
      nextContentHeight: 544,
      scrollTop: 0,
      viewportHeight: 520,
      minLineGapToKeyboard: DEFAULT_EDITOR_LINE_HEIGHT_PX,
    })).toBe(true);

    expect(shouldRefreshForNextLine({
      contentHeight: 320,
      nextContentHeight: 352,
      scrollTop: 0,
      viewportHeight: 520,
      minLineGapToKeyboard: DEFAULT_EDITOR_LINE_HEIGHT_PX,
    })).toBe(false);
  });
});
