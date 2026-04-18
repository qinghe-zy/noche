import { ref, type Ref } from "vue";

type RequestOptions = {
  prepare?: () => void;
};

export function useDeferredKeyboardViewportSync<T>({
  keyboardVisible,
  bodyViewportHeight,
  scheduleMeasurement,
}: {
  keyboardVisible: Readonly<Ref<boolean>>;
  bodyViewportHeight: Ref<number>;
  scheduleMeasurement: (flush: () => void) => void;
}) {
  const pendingKeyboardViewportSync = ref(false);
  const pendingPayload = ref<T | null>(null) as Ref<T | null>;

  function deferKeyboardViewportSync(payload: T): boolean {
    if (!keyboardVisible.value || bodyViewportHeight.value > 0) {
      return false;
    }

    pendingKeyboardViewportSync.value = true;
    pendingPayload.value = payload;
    return true;
  }

  function requestKeyboardViewportSync(payload: T, options: RequestOptions = {}): void {
    pendingKeyboardViewportSync.value = true;
    pendingPayload.value = payload;
    options.prepare?.();
    scheduleMeasurement(flushPendingKeyboardViewportSync);
  }

  function flushPendingKeyboardViewportSync(): T | null {
    if (!pendingKeyboardViewportSync.value || !keyboardVisible.value || bodyViewportHeight.value <= 0) {
      return null;
    }

    pendingKeyboardViewportSync.value = false;
    const payload = pendingPayload.value;
    pendingPayload.value = null;
    return payload;
  }

  function resetKeyboardViewportSync(): void {
    pendingKeyboardViewportSync.value = false;
    pendingPayload.value = null;
  }

  return {
    pendingKeyboardViewportSync,
    deferKeyboardViewportSync,
    requestKeyboardViewportSync,
    flushPendingKeyboardViewportSync,
    resetKeyboardViewportSync,
  };
}
