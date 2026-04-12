interface EditorAutosaveOptions {
  delayMs?: number;
  onSave: () => Promise<void>;
}

export interface EditorAutosaveController {
  schedule: () => void;
  flush: () => Promise<void>;
  cancel: () => void;
  isScheduled: () => boolean;
}

export function useEditorAutosave(options: EditorAutosaveOptions): EditorAutosaveController {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let runningPromise: Promise<void> | null = null;
  let shouldRunAgain = false;

  const clearScheduledTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const runSave = async () => {
    if (runningPromise) {
      shouldRunAgain = true;
      await runningPromise;
      return;
    }
    do {
      shouldRunAgain = false;
      runningPromise = Promise.resolve(options.onSave()).finally(() => {
        runningPromise = null;
      });

      await runningPromise;
    } while (shouldRunAgain);
  };

  return {
    schedule() {
      clearScheduledTimer();
      timer = setTimeout(() => {
        timer = null;
        void runSave();
      }, options.delayMs ?? 800);
    },
    async flush() {
      clearScheduledTimer();
      await runSave();
    },
    cancel() {
      clearScheduledTimer();
    },
    isScheduled() {
      return Boolean(timer);
    },
  };
}
