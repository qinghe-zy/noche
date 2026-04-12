import { computed } from "vue";
import { useMobileLayout } from "@/shared/layout/useMobileLayout";

export function useSafeAreaLayout() {
  const { metrics } = useMobileLayout();

  return {
    statusBarHeight: computed(() => metrics.statusBarHeight),
    navBarHeight: computed(() => metrics.navBarHeight),
    pageTopInset: computed(() => metrics.pageTopInset),
    safeAreaBottom: computed(() => metrics.safeBottom),
    viewportHeight: computed(() => metrics.viewportHeight),
    contentMinHeight: computed(() => metrics.contentMinHeight),
    sizeClass: computed(() => metrics.sizeClass),
  };
}
