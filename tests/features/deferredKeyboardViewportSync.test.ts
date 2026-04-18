import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import { useDeferredKeyboardViewportSync } from "@/features/editor/composables/useDeferredKeyboardViewportSync";

describe("deferred keyboard viewport sync", () => {
  it("defers sync requests until the keyboard is visible and the viewport height is measured", async () => {
    const keyboardVisible = ref(true);
    const bodyViewportHeight = ref(0);
    const scheduleMeasurement = vi.fn((flush: () => void) => {
      flush();
    });

    const {
      pendingKeyboardViewportSync,
      deferKeyboardViewportSync,
      requestKeyboardViewportSync,
      flushPendingKeyboardViewportSync,
      resetKeyboardViewportSync,
    } = useDeferredKeyboardViewportSync<number>({
      keyboardVisible,
      bodyViewportHeight,
      scheduleMeasurement,
    });

    expect(deferKeyboardViewportSync(24)).toBe(true);
    expect(pendingKeyboardViewportSync.value).toBe(true);
    expect(flushPendingKeyboardViewportSync()).toBeNull();

    bodyViewportHeight.value = 320;
    expect(flushPendingKeyboardViewportSync()).toBe(24);
    expect(pendingKeyboardViewportSync.value).toBe(false);

    bodyViewportHeight.value = 0;
    requestKeyboardViewportSync(48);
    expect(scheduleMeasurement).toHaveBeenCalledTimes(1);
    expect(flushPendingKeyboardViewportSync()).toBeNull();

    bodyViewportHeight.value = 280;
    await nextTick();
    expect(flushPendingKeyboardViewportSync()).toBe(48);

    requestKeyboardViewportSync(64);
    resetKeyboardViewportSync();
    expect(flushPendingKeyboardViewportSync()).toBeNull();
    expect(pendingKeyboardViewportSync.value).toBe(false);
  });

  it("does not defer when the keyboard is hidden or the viewport height is already ready", () => {
    const keyboardVisible = ref(false);
    const bodyViewportHeight = ref(240);

    const { deferKeyboardViewportSync, flushPendingKeyboardViewportSync } = useDeferredKeyboardViewportSync<number>({
      keyboardVisible,
      bodyViewportHeight,
      scheduleMeasurement: () => undefined,
    });

    expect(deferKeyboardViewportSync(12)).toBe(false);
    expect(flushPendingKeyboardViewportSync()).toBeNull();
  });

  it("keeps pending sync untouched when a scheduled flush runs before the real viewport height is ready", () => {
    const keyboardVisible = ref(true);
    const bodyViewportHeight = ref(0);
    let scheduledFlush: (() => number | null) | null = null;

    const {
      pendingKeyboardViewportSync,
      requestKeyboardViewportSync,
      flushPendingKeyboardViewportSync,
    } = useDeferredKeyboardViewportSync<number>({
      keyboardVisible,
      bodyViewportHeight,
      scheduleMeasurement: (flush) => {
        scheduledFlush = flush;
      },
    });

    requestKeyboardViewportSync(88);
    expect(pendingKeyboardViewportSync.value).toBe(true);

    expect(scheduledFlush).not.toBeNull();
    expect(scheduledFlush?.()).toBeNull();
    expect(pendingKeyboardViewportSync.value).toBe(true);

    bodyViewportHeight.value = 360;
    expect(flushPendingKeyboardViewportSync()).toBe(88);
    expect(pendingKeyboardViewportSync.value).toBe(false);
  });
});
