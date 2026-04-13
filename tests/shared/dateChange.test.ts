import { describe, expect, it, vi } from "vitest";
import { createDateChangeWatcher } from "@/shared/utils/dateChange";

describe("date change watcher", () => {
  it("fires once when the page lives across midnight", async () => {
    vi.useFakeTimers();
    let currentDateKey = "2026-04-12";
    const onDateChange = vi.fn();
    const watcher = createDateChangeWatcher({
      getDateKey: () => currentDateKey,
      onDateChange,
      getDelayMs: () => 1000,
    });

    watcher.start();
    currentDateKey = "2026-04-13";
    await vi.advanceTimersByTimeAsync(1000);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    expect(onDateChange).toHaveBeenCalledWith("2026-04-13");
    watcher.stop();
    vi.useRealTimers();
  });
});
