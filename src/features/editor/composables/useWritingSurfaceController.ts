import {
  computed,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
  type Ref,
} from "vue";
import { syncMobileLayoutVars } from "@/shared/layout/mobileLayout";
import {
  estimateCaretLine,
  resolvePlainTextLineCount,
  resolveUsableWritingViewport,
  resolveViewportScrollEnabled,
  resolveWritingSurfaceExpansion,
  resolveWritingSurfaceProfile,
  resolveWritingScrollTarget,
  type WritingSurfaceVariant,
} from "@/features/editor/composables/writingSurfaceController.shared";

type EditorMode = "edit" | "read";

interface UseWritingSurfaceControllerOptions {
  variant: WritingSurfaceVariant;
  mode: Ref<EditorMode>;
  content: Ref<string>;
  layoutSignature?: Ref<string | number | boolean>;
}

interface RectLike {
  top: number;
  height: number;
}

interface KeyboardHeightEventLike {
  detail?: {
    height?: number;
  };
}

interface InputEventLike {
  detail?: {
    cursor?: number;
    value?: string;
  };
}

interface LineChangeEventLike {
  detail?: {
    height?: number;
    lineCount?: number;
  };
}

function buildElementIds(prefix: string) {
  return {
    body: `${prefix}-body`,
    content: `${prefix}-content`,
    surface: `${prefix}-surface`,
  };
}

function normalizeRect(value: unknown): RectLike {
  if (!value || typeof value !== "object") {
    return { top: 0, height: 0 };
  }

  const rect = value as { top?: number; height?: number };
  return {
    top: Number.isFinite(rect.top) ? Number(rect.top) : 0,
    height: Number.isFinite(rect.height) ? Number(rect.height) : 0,
  };
}

function requestFrame(callback: () => void): number {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }

  return setTimeout(callback, 16) as unknown as number;
}

function cancelFrame(frameId: number): void {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(frameId);
    return;
  }

  clearTimeout(frameId);
}

function queryRects(selectors: string[]): Promise<RectLike[]> {
  return new Promise((resolve) => {
    const query = uni.createSelectorQuery();

    selectors.forEach((selector) => {
      query.select(selector).boundingClientRect();
    });

    query.exec((results: unknown[]) => {
      resolve((results ?? []).map((result) => normalizeRect(result)));
    });
  });
}

function readCssPixelVar(name: string, fallback: number): number {
  if (typeof document === "undefined" || !document.documentElement) {
    return fallback;
  }

  const rawValue = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const parsed = Number.parseFloat(rawValue);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function useWritingSurfaceController(options: UseWritingSurfaceControllerOptions) {
  const instance = getCurrentInstance();
  const ids = buildElementIds(`noche-writing-${instance?.uid ?? Date.now()}`);
  const profile = resolveWritingSurfaceProfile(options.variant);
  const bodyHeight = ref(0);
  const scrollTop = ref(0);
  const currentScrollTop = ref(0);
  const scrollEnabled = ref(false);
  const keyboardHeight = ref(0);
  const safeAreaBottom = ref(0);
  const viewportHeight = ref(uni.getSystemInfoSync().windowHeight || 800);
  const contentHeight = ref(0);
  const totalLineCount = ref(resolvePlainTextLineCount(unref(options.content)));
  const renderedLines = ref(profile.baseLines);
  const cursorIndex = ref(unref(options.content).length);
  const isFocused = ref(false);
  const baselineBodyHeight = ref(0);
  let stableViewportHeight = 0;
  let measureFrame = 0;
  let scrollFrame = 0;
  let pendingScrollTop: number | null = null;

  function refreshViewportMetrics(): void {
    stableViewportHeight = syncMobileLayoutVars(stableViewportHeight);
    const fallbackViewportHeight = stableViewportHeight || uni.getSystemInfoSync().windowHeight || 800;
    viewportHeight.value = readCssPixelVar("--noche-viewport-height", fallbackViewportHeight);
    safeAreaBottom.value = readCssPixelVar("--noche-safe-bottom", 0);
  }

  function syncRenderedLines(nextContent: string, allowShrink: boolean): void {
    const fallbackLineCount = Math.max(totalLineCount.value, resolvePlainTextLineCount(nextContent));
    const expansion = resolveWritingSurfaceExpansion({
      contentHeight: contentHeight.value,
      fallbackLineCount,
      renderedLines: allowShrink ? profile.baseLines : renderedLines.value,
      profile,
    });

    totalLineCount.value = Math.max(totalLineCount.value, expansion.contentLines);
    renderedLines.value = expansion.nextRenderedLines;
  }

  async function measureLayout(): Promise<void> {
    await nextTick();
    refreshViewportMetrics();

    const [bodyRect, contentRect, surfaceRect] = await queryRects([
      `#${ids.body}`,
      `#${ids.content}`,
      `#${ids.surface}`,
    ]);

    if (!bodyRect.height) {
      return;
    }

    if (keyboardHeight.value === 0) {
      baselineBodyHeight.value = bodyRect.height;
    }

    const usableViewportHeight = resolveUsableWritingViewport({
      viewportHeight: viewportHeight.value,
      keyboardHeight: keyboardHeight.value,
      safeAreaBottom: safeAreaBottom.value,
      footerReserve: profile.footerReserve,
    });
    const bodyHeightFromViewport = Math.max(160, usableViewportHeight - bodyRect.top);
    const bodyHeightFromBaseline = Math.max(
      160,
      (baselineBodyHeight.value || bodyRect.height) - keyboardHeight.value,
    );
    bodyHeight.value = Math.round(Math.min(bodyHeightFromViewport, bodyHeightFromBaseline));

    scrollEnabled.value = resolveViewportScrollEnabled({
      bodyViewportHeight: bodyHeight.value,
      contentHeight: contentRect.height,
    });

    if (!scrollEnabled.value) {
      scheduleScroll(0);
      return;
    }

    if (unref(options.mode) !== "edit" || !keyboardHeight.value) {
      return;
    }

    const caretLine = estimateCaretLine({
      value: unref(options.content),
      cursor: cursorIndex.value,
      totalLineCount: totalLineCount.value,
    });
    const surfaceTop = Math.max(0, surfaceRect.top - contentRect.top);
    const caretTop = surfaceTop + profile.firstLineOffset + (caretLine - 1) * profile.linePitch;
    const scrollTarget = resolveWritingScrollTarget({
      caretTop,
      currentScrollTop: currentScrollTop.value,
      bodyViewportHeight: bodyHeight.value,
      contentHeight: contentRect.height,
      profile,
    });

    if (scrollTarget.shouldScroll) {
      scheduleScroll(scrollTarget.targetScrollTop);
    }
  }

  function scheduleMeasure(): void {
    if (measureFrame) {
      return;
    }

    measureFrame = requestFrame(() => {
      measureFrame = 0;
      void measureLayout();
    });
  }

  function scheduleScroll(nextScrollTop: number): void {
    pendingScrollTop = nextScrollTop;

    if (scrollFrame) {
      return;
    }

    scrollFrame = requestFrame(() => {
      scrollFrame = 0;
      if (pendingScrollTop == null) {
        return;
      }

      scrollTop.value = pendingScrollTop;
      currentScrollTop.value = pendingScrollTop;
      pendingScrollTop = null;
    });
  }

  function handleScroll(event: { detail?: { scrollTop?: number } }): void {
    const nextScrollTop = event.detail?.scrollTop;
    currentScrollTop.value = Number.isFinite(nextScrollTop) ? Number(nextScrollTop) : currentScrollTop.value;
  }

  function handleInput(event: Event | InputEventLike): void {
    const inputEvent = event as InputEventLike;
    const nextCursor = inputEvent.detail?.cursor;

    if (typeof nextCursor === "number" && Number.isFinite(nextCursor)) {
      cursorIndex.value = nextCursor;
    } else if (typeof inputEvent.detail?.value === "string") {
      cursorIndex.value = inputEvent.detail.value.length;
    }

    scheduleMeasure();
  }

  function handleLineChange(event: LineChangeEventLike): void {
    const nextHeight = event.detail?.height;
    const nextLineCount = event.detail?.lineCount;

    contentHeight.value = Number.isFinite(nextHeight)
      ? Number(nextHeight)
      : totalLineCount.value * profile.linePitch;
    totalLineCount.value = Number.isFinite(nextLineCount)
      ? Math.max(1, Number(nextLineCount))
      : totalLineCount.value;
    syncRenderedLines(unref(options.content), false);
    scheduleMeasure();
  }

  function handleKeyboardHeightChange(event: KeyboardHeightEventLike): void {
    keyboardHeight.value = Number.isFinite(event.detail?.height) ? Number(event.detail?.height) : 0;
    scheduleMeasure();
  }

  function handleFocus(): void {
    isFocused.value = true;
    scheduleMeasure();
  }

  function handleBlur(): void {
    isFocused.value = false;
  }

  const cursorSpacing = computed(() =>
    Math.max(profile.linePitch * 2, Math.round(bodyHeight.value * 0.18) || 88),
  );

  const surfaceStyle = computed(() => {
    const expansion = resolveWritingSurfaceExpansion({
      contentHeight: contentHeight.value,
      fallbackLineCount: totalLineCount.value,
      renderedLines: renderedLines.value,
      profile,
    });

    return {
      "--noche-writing-line-pitch": `${profile.linePitch}px`,
      "--noche-writing-line-height": `${profile.lineHeight}px`,
      "--noche-writing-baseline-offset": `${profile.baselineOffset}px`,
      "--noche-writing-first-line-offset": `${profile.firstLineOffset}px`,
      minHeight: `${expansion.targetHeight}px`,
    };
  });

  const bodyStyle = computed(() => (
    bodyHeight.value > 0
      ? {
          height: `${bodyHeight.value}px`,
          maxHeight: `${bodyHeight.value}px`,
        }
      : {}
  ));

  watch(
    () => unref(options.content),
    (nextContent, previousContent) => {
      const shouldAllowShrink = !isFocused.value || keyboardHeight.value === 0;
      if (nextContent.length === 0) {
        contentHeight.value = 0;
        totalLineCount.value = 1;
        renderedLines.value = profile.baseLines;
        cursorIndex.value = 0;
      } else {
        totalLineCount.value = resolvePlainTextLineCount(nextContent);
        if (shouldAllowShrink) {
          renderedLines.value = profile.baseLines;
        }
        if (shouldAllowShrink && nextContent !== previousContent) {
          cursorIndex.value = nextContent.length;
        }
        syncRenderedLines(nextContent, shouldAllowShrink);
      }

      scheduleMeasure();
    },
    {
      immediate: true,
    },
  );

  watch(
    () => [unref(options.mode), unref(options.layoutSignature)] as const,
    () => {
      scheduleMeasure();
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    refreshViewportMetrics();
    scheduleMeasure();
  });

  onUnmounted(() => {
    if (measureFrame) {
      cancelFrame(measureFrame);
      measureFrame = 0;
    }

    if (scrollFrame) {
      cancelFrame(scrollFrame);
      scrollFrame = 0;
    }
  });

  return {
    ids,
    bodyHeight,
    bodyStyle,
    cursorSpacing,
    handleBlur,
    handleFocus,
    handleInput,
    handleKeyboardHeightChange,
    handleLineChange,
    handleScroll,
    requestMeasure: scheduleMeasure,
    scrollEnabled,
    scrollTop,
    surfaceStyle,
  };
}
