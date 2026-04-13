import { describe, expect, it, vi } from "vitest";
import { useEditorFeedbackState } from "@/features/editor/composables/useEditorFeedbackState";

describe("editor feedback state", () => {
  it("marks dirty state and dims the seal", () => {
    const feedback = useEditorFeedbackState();

    feedback.markDirty();

    expect(feedback.hasPendingAutosave.value).toBe(true);
    expect(feedback.stampOpacity.value).toBe(0.08);
  });

  it("shows a short-lived saved hint after autosave succeeds", async () => {
    vi.useFakeTimers();
    const feedback = useEditorFeedbackState({ savedHintDurationMs: 1500 });

    feedback.markDirty();
    feedback.markSaved();

    expect(feedback.hasPendingAutosave.value).toBe(false);
    expect(feedback.showSavedHint.value).toBe(true);

    vi.advanceTimersByTime(1500);
    await vi.runAllTimersAsync();

    expect(feedback.showSavedHint.value).toBe(false);
    vi.useRealTimers();
  });
});
