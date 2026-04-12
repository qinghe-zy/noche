import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, unref, watch, type Ref } from "vue";

interface ViewportContentFitOptions {
  layoutSignature?: Ref<string | number | boolean>;
}

interface RectLike {
  top: number;
  height: number;
}

function buildElementIds(prefix: string) {
  return {
    body: `${prefix}-body`,
    content: `${prefix}-content`,
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

export function useViewportContentFit(options: ViewportContentFitOptions = {}) {
  const instance = getCurrentInstance();
  const ids = buildElementIds(`noche-viewport-fit-${instance?.uid ?? Date.now()}`);
  const scrollEnabled = ref(true);
  let measureFrame = 0;

  async function measureLayout(): Promise<void> {
    await nextTick();
    const [bodyRect, contentRect] = await queryRects([
      `#${ids.body}`,
      `#${ids.content}`,
    ]);

    scrollEnabled.value = contentRect.height > bodyRect.height + 1;
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

  watch(
    () => unref(options.layoutSignature),
    () => {
      scheduleMeasure();
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {
    scheduleMeasure();
  });

  onUnmounted(() => {
    if (measureFrame) {
      cancelFrame(measureFrame);
      measureFrame = 0;
    }
  });

  return {
    ids,
    scrollEnabled,
    requestMeasure: scheduleMeasure,
  };
}
