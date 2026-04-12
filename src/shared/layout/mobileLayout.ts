interface MobileLayoutSystemInfo {
  windowHeight?: number;
  windowWidth?: number;
  screenHeight?: number;
  statusBarHeight?: number;
  safeArea?: {
    top?: number;
    bottom?: number;
    height?: number;
  };
  safeAreaInsets?: {
    top?: number;
    bottom?: number;
  };
}

interface LayoutStyleTarget {
  setProperty(name: string, value: string): void;
}

export interface MobileLayoutMetrics {
  viewportHeight: number;
  statusBarHeight: number;
  navBarHeight: number;
  pageTopInset: number;
  contentMinHeight: number;
  safeTop: number;
  safeBottom: number;
  topbarPaddingTop: number;
  topbarPaddingBottom: number;
  topbarPaddingX: number;
  topbarRowHeight: number;
  topbarBlockHeight: number;
  pagePaddingX: number;
  pageSectionGap: number;
  pageSectionGapTight: number;
  pageBottomPadding: number;
  fabBottom: number;
  emptyStateMinHeight: number;
  editorTextareaMinHeight: number;
}

const DESIGN_RPX = {
  topbarPaddingX: 32,
  pagePaddingX: 28,
  pageSectionGap: 24,
  pageSectionGapTight: 16,
  pageBottomPadding: 36,
  fabBottom: 28,
  emptyStateMinHeight: 420,
  editorTextareaMinHeight: 560,
} as const;
const FIXED_NAV_BAR_HEIGHT_PX = 44;

function toNumber(value: number | undefined): number {
  return Number.isFinite(value) ? Number(value) : 0;
}

export function rpxToPx(rpx: number, windowWidth = 375): number {
  return Math.round((rpx * windowWidth) / 750);
}

export function computeMobileLayoutMetrics(
  systemInfo: MobileLayoutSystemInfo,
  previousViewportHeight = 0,
): MobileLayoutMetrics {
  const windowWidth = Math.max(320, toNumber(systemInfo.windowWidth) || 375);
  const rawSafeTop = Math.max(
    toNumber(systemInfo.statusBarHeight),
    toNumber(systemInfo.safeAreaInsets?.top),
    toNumber(systemInfo.safeArea?.top),
  );
  const rawSafeBottom = Math.max(
    toNumber(systemInfo.safeAreaInsets?.bottom),
    systemInfo.screenHeight && systemInfo.safeArea?.bottom
      ? Math.max(0, Math.round(systemInfo.screenHeight - systemInfo.safeArea.bottom))
      : 0,
  );
  const rawViewportHeight = Math.round(
    toNumber(systemInfo.windowHeight)
      || toNumber(systemInfo.safeArea?.height)
      || previousViewportHeight
      || 780,
  );
  const viewportHeight = Math.max(previousViewportHeight, rawViewportHeight, 640);
  const statusBarHeight = rawSafeTop;
  const navBarHeight = FIXED_NAV_BAR_HEIGHT_PX;
  const pageTopInset = statusBarHeight + navBarHeight;
  const topbarPaddingTop = statusBarHeight;
  const topbarPaddingBottom = 0;
  const topbarRowHeight = navBarHeight;
  const pageBottomPadding = rawSafeBottom + rpxToPx(DESIGN_RPX.pageBottomPadding, windowWidth);
  const contentMinHeight = Math.max(
    280,
    viewportHeight - pageTopInset - rawSafeBottom,
  );

  return {
    viewportHeight,
    statusBarHeight,
    navBarHeight,
    pageTopInset,
    contentMinHeight,
    safeTop: rawSafeTop,
    safeBottom: rawSafeBottom,
    topbarPaddingTop,
    topbarPaddingBottom,
    topbarPaddingX: rpxToPx(DESIGN_RPX.topbarPaddingX, windowWidth),
    topbarRowHeight,
    topbarBlockHeight: topbarPaddingTop + topbarPaddingBottom + topbarRowHeight,
    pagePaddingX: rpxToPx(DESIGN_RPX.pagePaddingX, windowWidth),
    pageSectionGap: rpxToPx(DESIGN_RPX.pageSectionGap, windowWidth),
    pageSectionGapTight: rpxToPx(DESIGN_RPX.pageSectionGapTight, windowWidth),
    pageBottomPadding,
    fabBottom: rawSafeBottom + rpxToPx(DESIGN_RPX.fabBottom, windowWidth),
    emptyStateMinHeight: Math.max(
      rpxToPx(DESIGN_RPX.emptyStateMinHeight, windowWidth),
      Math.floor(contentMinHeight * 0.48),
    ),
    editorTextareaMinHeight: Math.max(
      rpxToPx(DESIGN_RPX.editorTextareaMinHeight, windowWidth),
      Math.floor(contentMinHeight * 0.52),
    ),
  };
}

export function applyMobileLayoutVars(
  target: LayoutStyleTarget,
  metrics: MobileLayoutMetrics,
): void {
  target.setProperty("--noche-safe-top", `${metrics.safeTop}px`);
  target.setProperty("--noche-safe-bottom", `${metrics.safeBottom}px`);
  target.setProperty("--noche-viewport-height", `${metrics.viewportHeight}px`);
  target.setProperty("--noche-status-bar-height", `${metrics.statusBarHeight}px`);
  target.setProperty("--noche-nav-bar-height", `${metrics.navBarHeight}px`);
  target.setProperty("--noche-page-top-inset", `${metrics.pageTopInset}px`);
  target.setProperty("--noche-content-min-height", `${metrics.contentMinHeight}px`);
  target.setProperty("--noche-topbar-padding-top", `${metrics.topbarPaddingTop}px`);
  target.setProperty("--noche-topbar-padding-bottom", `${metrics.topbarPaddingBottom}px`);
  target.setProperty("--noche-topbar-padding-x", `${metrics.topbarPaddingX}px`);
  target.setProperty("--noche-topbar-row-height", `${metrics.topbarRowHeight}px`);
  target.setProperty("--noche-topbar-block-height", `${metrics.topbarBlockHeight}px`);
  target.setProperty("--noche-page-padding-x", `${metrics.pagePaddingX}px`);
  target.setProperty("--noche-page-section-gap", `${metrics.pageSectionGap}px`);
  target.setProperty("--noche-page-section-gap-tight", `${metrics.pageSectionGapTight}px`);
  target.setProperty("--noche-page-bottom-padding", `${metrics.pageBottomPadding}px`);
  target.setProperty("--noche-fab-bottom", `${metrics.fabBottom}px`);
  target.setProperty("--noche-empty-state-min-height", `${metrics.emptyStateMinHeight}px`);
  target.setProperty("--noche-editor-textarea-min-height", `${metrics.editorTextareaMinHeight}px`);
}

export function syncMobileLayoutVars(previousViewportHeight = 0): number {
  if (typeof uni === "undefined" || typeof uni.getSystemInfoSync !== "function") {
    return previousViewportHeight;
  }

  const metrics = computeMobileLayoutMetrics(uni.getSystemInfoSync(), previousViewportHeight);

  if (typeof document !== "undefined") {
    const targets: LayoutStyleTarget[] = [];

    if (document.documentElement?.style) {
      targets.push(document.documentElement.style);
    }

    if (document.body?.style) {
      targets.push(document.body.style);
    }

    if (typeof document.querySelectorAll === "function") {
      document
        .querySelectorAll<HTMLElement>("#app, .uni-app, .uni-page-body, .uni-page-wrapper")
        .forEach((element) => {
          if (element?.style) {
            targets.push(element.style);
          }
        });
    }

    targets.forEach((target) => {
      applyMobileLayoutVars(target, metrics);
    });
  }

  return metrics.viewportHeight;
}
