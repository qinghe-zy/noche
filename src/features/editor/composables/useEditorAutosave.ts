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

  // Tracks the entire run loop (all do-while iterations), not just one onSave call.
  // Any caller that awaits this will block until the loop is fully drained.
  let runningPromise: Promise<void> | null = null;

  // Set to true by a second caller while the loop is running.
  // The loop checks this flag after each save and re-runs if needed.
  let shouldRunAgain = false;

  const clearScheduledTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const runSave = async () => {
    if (runningPromise) {
      // A loop is already in progress. Signal it to run one more time after
      // its current iteration, then wait for the whole loop to finish.
      // This means flush() will not resolve until that extra iteration is done.
      shouldRunAgain = true;
      await runningPromise;
      return;
    }

    // Wrap the entire drain loop in a single promise so that every concurrent
    // caller awaiting runningPromise waits for ALL iterations, not just the first.
    runningPromise = (async () => {
      do {
        shouldRunAgain = false;
        await options.onSave();
      } while (shouldRunAgain);
    })().finally(() => {
      runningPromise = null;
    });

    await runningPromise;
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