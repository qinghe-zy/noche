import { describe, expect, it, vi } from "vitest";
import { useEditorAutosave } from "@/features/editor/composables/useEditorAutosave";

describe("editor autosave", () => {
  it("debounces draft saves around 800ms", async () => {
    vi.useFakeTimers();
    const onSave = vi.fn(async () => {});
    const autosave = useEditorAutosave({ onSave, delayMs: 800 });

    autosave.schedule();
    vi.advanceTimersByTime(400);
    autosave.schedule();
    vi.advanceTimersByTime(799);

    expect(onSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    await vi.runAllTimersAsync();

    expect(onSave).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it("flushes immediately for formal save", async () => {
    const onSave = vi.fn(async () => {});
    const autosave = useEditorAutosave({ onSave, delayMs: 800 });

    autosave.schedule();
    await autosave.flush();

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
