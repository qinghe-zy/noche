export interface DateChangeWatcher {
  start(): void;
  stop(): void;
  sync(): void;
}

interface CreateDateChangeWatcherOptions {
  getDateKey: () => string;
  onDateChange: (nextDateKey: string) => void | Promise<void>;
  getDelayMs?: () => number;
}

function millisecondsUntilNextDay(now: Date = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 1, 0);
  return Math.max(1000, next.getTime() - now.getTime());
}

export function createDateChangeWatcher(
  options: CreateDateChangeWatcherOptions,
): DateChangeWatcher {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastDateKey = options.getDateKey();

  const clearTimer = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const schedule = () => {
    clearTimer();
    timer = setTimeout(async () => {
      const nextDateKey = options.getDateKey();
      if (nextDateKey !== lastDateKey) {
        lastDateKey = nextDateKey;
        await options.onDateChange(nextDateKey);
      }
      schedule();
    }, options.getDelayMs ? options.getDelayMs() : millisecondsUntilNextDay());
  };

  return {
    start() {
      lastDateKey = options.getDateKey();
      schedule();
    },
    stop() {
      clearTimer();
    },
    sync() {
      const nextDateKey = options.getDateKey();
      if (nextDateKey !== lastDateKey) {
        lastDateKey = nextDateKey;
        void options.onDateChange(nextDateKey);
      }
      schedule();
    },
  };
}
