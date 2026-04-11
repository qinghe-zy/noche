import { computed, ref } from "vue";

interface EditorFeedbackOptions {
  savedHintDurationMs?: number;
}

export function useEditorFeedbackState(options: EditorFeedbackOptions = {}) {
  const hasPendingAutosave = ref(false);
  const showSavedHint = ref(false);
  let savedHintTimer: ReturnType<typeof setTimeout> | null = null;

  const clearSavedHintTimer = () => {
    if (savedHintTimer) {
      clearTimeout(savedHintTimer);
      savedHintTimer = null;
    }
  };

  const stampOpacity = computed(() => (hasPendingAutosave.value ? 0.08 : 0.16));

  return {
    hasPendingAutosave,
    showSavedHint,
    stampOpacity,
    markDirty() {
      hasPendingAutosave.value = true;
      showSavedHint.value = false;
      clearSavedHintTimer();
    },
    markSaved() {
      hasPendingAutosave.value = false;
      showSavedHint.value = true;
      clearSavedHintTimer();
      savedHintTimer = setTimeout(() => {
        showSavedHint.value = false;
        savedHintTimer = null;
      }, options.savedHintDurationMs ?? 1500);
    },
    reset() {
      hasPendingAutosave.value = false;
      showSavedHint.value = false;
      clearSavedHintTimer();
    },
  };
}
