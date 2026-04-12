import { computed } from "vue";

function readCssPixelVar(name: string, fallback: number): number {
  if (typeof document === "undefined" || !document.documentElement) {
    return fallback;
  }

  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function useSafeAreaLayout() {
  const statusBarHeight = computed(() => readCssPixelVar("--noche-status-bar-height", 0));
  const navBarHeight = computed(() => readCssPixelVar("--noche-nav-bar-height", 44));
  const pageTopInset = computed(() => readCssPixelVar("--noche-page-top-inset", statusBarHeight.value + navBarHeight.value));
  const safeAreaBottom = computed(() => readCssPixelVar("--noche-safe-bottom", 0));
  const viewportHeight = computed(() => readCssPixelVar("--noche-viewport-height", 0));
  const contentMinHeight = computed(() => readCssPixelVar("--noche-content-min-height", Math.max(0, viewportHeight.value - pageTopInset.value - safeAreaBottom.value)));

  return {
    statusBarHeight,
    navBarHeight,
    pageTopInset,
    safeAreaBottom,
    viewportHeight,
    contentMinHeight,
  };
}
