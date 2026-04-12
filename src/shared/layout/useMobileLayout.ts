import { computed, reactive, readonly } from "vue";
import {
  applyMobileLayoutVars,
  computeMobileLayoutMetrics,
  type MobileLayoutMetrics,
  type MobileLayoutSystemInfo,
} from "@/shared/layout/mobileLayout";

const mobileLayoutState = reactive<MobileLayoutMetrics>(
  computeMobileLayoutMetrics({}, 0),
);

let stableViewportHeight = mobileLayoutState.viewportHeight;

function readRuntimeSystemInfo(): MobileLayoutSystemInfo {
  if (typeof uni === "undefined") {
    return {};
  }

  if (typeof uni.getWindowInfo === "function") {
    return uni.getWindowInfo();
  }

  if (typeof uni.getSystemInfoSync === "function") {
    return uni.getSystemInfoSync();
  }

  return {};
}

function syncCssVars(metrics: MobileLayoutMetrics): void {
  if (typeof document === "undefined") {
    return;
  }

  const targets = new Set<CSSStyleDeclaration>();

  if (document.documentElement?.style) {
    targets.add(document.documentElement.style);
  }

  if (document.body?.style) {
    targets.add(document.body.style);
  }

  if (typeof document.querySelectorAll === "function") {
    document
      .querySelectorAll<HTMLElement>("#app, .uni-app, .uni-page-body, .uni-page-wrapper")
      .forEach((element) => {
        if (element?.style) {
          targets.add(element.style);
        }
      });
  }

  targets.forEach((target) => {
    applyMobileLayoutVars(target, metrics);
  });
}

export function refreshMobileLayout(previousViewportHeight = stableViewportHeight): MobileLayoutMetrics {
  const metrics = computeMobileLayoutMetrics(readRuntimeSystemInfo(), previousViewportHeight);
  stableViewportHeight = metrics.viewportHeight;
  Object.assign(mobileLayoutState, metrics);
  syncCssVars(metrics);
  return metrics;
}

export function useMobileLayout() {
  const metrics = readonly(mobileLayoutState);

  return {
    metrics,
    sizeClass: computed(() => metrics.sizeClass),
    safeTop: computed(() => metrics.safeTop),
    safeBottom: computed(() => metrics.safeBottom),
    viewportHeight: computed(() => metrics.viewportHeight),
    pageTopInset: computed(() => metrics.pageTopInset),
    contentMinHeight: computed(() => metrics.contentMinHeight),
    topbarBlockHeight: computed(() => metrics.topbarBlockHeight),
    pagePaddingX: computed(() => metrics.pagePaddingX),
    pageBottomPadding: computed(() => metrics.pageBottomPadding),
    fabBottom: computed(() => metrics.fabBottom),
    refresh: refreshMobileLayout,
  };
}
