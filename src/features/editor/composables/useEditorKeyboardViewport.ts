import { computed, onBeforeUnmount, ref } from "vue";

export const DEFAULT_EDITOR_LINE_HEIGHT_PX = 44;
export const TOPBAR_HORIZONTAL_PADDING_RPX = 32;
export const TOPBAR_BOTTOM_SPACING_RPX = 24;

type SafeAreaRect = {
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  width?: number;
  height?: number;
};

type EditorSystemSnapshot = {
  safeArea?: SafeAreaRect;
  screenHeight?: number;
  screenWidth?: number;
  statusBarHeight?: number;
  windowHeight?: number;
  keyboardHeight?: number;
  keyboardVisible?: boolean;
};

type KeyboardHeightChangePayload = {
  height?: number;
};

export function rpxToPx(value: number, screenWidth = 375): number {
  return Math.round((value * screenWidth) / 750);
}

export function createEditorViewportSnapshot({
  safeArea,
  screenHeight = 800,
  screenWidth = 375,
  statusBarHeight = 0,
  windowHeight = screenHeight,
  keyboardHeight = 0,
  keyboardVisible = keyboardHeight > 0,
}: EditorSystemSnapshot) {
  const safeAreaBottom = Math.max(screenHeight - (safeArea?.bottom ?? windowHeight), 0);
  const topbarHorizontalPadding = rpxToPx(TOPBAR_HORIZONTAL_PADDING_RPX, screenWidth);
  const topbarBottomSpacing = rpxToPx(TOPBAR_BOTTOM_SPACING_RPX, screenWidth);
  const topbarTop = statusBarHeight + topbarHorizontalPadding;
  const homeTop = statusBarHeight + rpxToPx(48, screenWidth);
  const homeBottomPadding = safeAreaBottom + topbarHorizontalPadding;
  const attachmentDockBottom = (keyboardVisible ? keyboardHeight : safeAreaBottom) + topbarBottomSpacing;

  return {
    screenHeight,
    screenWidth,
    windowHeight,
    statusBarHeight,
    safeAreaBottom,
    keyboardHeight,
    keyboardVisible,
    topbarTop,
    topbarHorizontalPadding,
    topbarBottomSpacing,
    homeTop,
    homeBottomPadding,
    minLineGapToKeyboard: DEFAULT_EDITOR_LINE_HEIGHT_PX,
    attachmentDockBottom,
    cursorSpacing: DEFAULT_EDITOR_LINE_HEIGHT_PX,
    restoreAfterKeyboardHide: safeAreaBottom + rpxToPx(24, screenWidth),
  };
}

export function shouldRefreshForNextLine({
  contentHeight,
  nextContentHeight,
  scrollTop,
  viewportHeight,
  minLineGapToKeyboard,
}: {
  contentHeight: number;
  nextContentHeight: number;
  scrollTop: number;
  viewportHeight: number;
  minLineGapToKeyboard: number;
}): boolean {
  const currentVisibleBottom = scrollTop + viewportHeight;
  const currentGap = currentVisibleBottom - contentHeight;
  const nextGap = currentVisibleBottom - nextContentHeight;

  return currentGap <= minLineGapToKeyboard || nextGap < minLineGapToKeyboard;
}

function resolveSystemSnapshot(): EditorSystemSnapshot {
  const rawSystemInfo = typeof uni !== "undefined" && typeof uni.getSystemInfoSync === "function"
    ? uni.getSystemInfoSync()
    : {};
  const systemInfo = rawSystemInfo as Record<string, unknown>;

  return {
    safeArea: systemInfo.safeArea as SafeAreaRect | undefined,
    screenHeight: typeof systemInfo.screenHeight === "number" ? systemInfo.screenHeight : undefined,
    screenWidth: typeof systemInfo.screenWidth === "number" ? systemInfo.screenWidth : undefined,
    statusBarHeight: typeof systemInfo.statusBarHeight === "number" ? systemInfo.statusBarHeight : undefined,
    windowHeight: typeof systemInfo.windowHeight === "number" ? systemInfo.windowHeight : undefined,
  };
}

export function useEditorKeyboardViewport() {
  const systemSnapshot = ref(createEditorViewportSnapshot(resolveSystemSnapshot()));
  const keyboardHeight = ref(0);
  const keyboardVisible = ref(false);

  const syncSnapshot = () => {
    systemSnapshot.value = createEditorViewportSnapshot({
      ...resolveSystemSnapshot(),
      keyboardHeight: keyboardHeight.value,
      keyboardVisible: keyboardVisible.value,
    });
  };

  const handleKeyboardHeightChange = (payload: KeyboardHeightChangePayload) => {
    keyboardHeight.value = Math.max(payload.height ?? 0, 0);
    keyboardVisible.value = keyboardHeight.value > 0;
    syncSnapshot();
  };

  const keyboardApi = typeof uni !== "undefined"
    ? {
      on: typeof uni.onKeyboardHeightChange === "function" ? uni.onKeyboardHeightChange.bind(uni) : null,
      off: typeof uni.offKeyboardHeightChange === "function" ? uni.offKeyboardHeightChange.bind(uni) : null,
    }
    : {
      on: null,
      off: null,
    };

  keyboardApi.on?.(handleKeyboardHeightChange);

  onBeforeUnmount(() => {
    keyboardApi.off?.(handleKeyboardHeightChange);
  });

  const statusBarHeight = computed(() => systemSnapshot.value.statusBarHeight);
  const safeAreaBottom = computed(() => systemSnapshot.value.safeAreaBottom);
  const topbarTop = computed(() => systemSnapshot.value.topbarTop);
  const topbarHorizontalPadding = computed(() => systemSnapshot.value.topbarHorizontalPadding);
  const topbarBottomSpacing = computed(() => systemSnapshot.value.topbarBottomSpacing);
  const homeTop = computed(() => systemSnapshot.value.homeTop);
  const homeBottomPadding = computed(() => systemSnapshot.value.homeBottomPadding);
  const attachmentDockBottom = computed(() => systemSnapshot.value.attachmentDockBottom);
  const minLineGapToKeyboard = computed(() => systemSnapshot.value.minLineGapToKeyboard);
  const cursorSpacing = computed(() => systemSnapshot.value.cursorSpacing);
  const restoreAfterKeyboardHide = computed(() => systemSnapshot.value.restoreAfterKeyboardHide);
  const windowHeight = computed(() => systemSnapshot.value.windowHeight);
  const screenWidth = computed(() => systemSnapshot.value.screenWidth);
  const keyboardCompensation = computed(() => (keyboardVisible.value ? keyboardHeight.value : 0));

  return {
    statusBarHeight,
    safeAreaBottom,
    keyboardHeight,
    keyboardVisible,
    cursorSpacing,
    topbarTop,
    topbarHorizontalPadding,
    topbarBottomSpacing,
    homeTop,
    homeBottomPadding,
    attachmentDockBottom,
    minLineGapToKeyboard,
    restoreAfterKeyboardHide,
    keyboardCompensation,
    windowHeight,
    screenWidth,
    rpxToPx: (value: number) => rpxToPx(value, screenWidth.value),
    refreshSnapshot: syncSnapshot,
  };
}
