import { describe, expect, it } from "vitest";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import {
  shouldOpenDiaryPreludePicker,
  shouldRenderDiaryPreludeHeaderMeta,
  shouldAllowDiaryPreludeEdit,
} from "@/features/editor/diaryPreludeState";

describe("diary prelude state", () => {
  it("opens the picker only for unseen diary edit flows", () => {
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "edit",
        diaryPreludeStatus: "unseen",
        diaryPrelude: null,
      }),
    ).toBe(true);
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "edit",
        diaryPreludeStatus: "selected",
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: "anxious",
        }),
      }),
    ).toBe(false);
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "edit",
        diaryPreludeStatus: "skipped",
        diaryPrelude: null,
      }),
    ).toBe(false);
  });

  it("does not open the picker for read mode or non-diary types", () => {
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "read",
        diaryPreludeStatus: "unseen",
        diaryPrelude: null,
      }),
    ).toBe(false);
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "jotting",
        mode: "edit",
        diaryPreludeStatus: "unseen",
        diaryPrelude: null,
      }),
    ).toBe(false);
  });

  it("renders header meta only for selected diary prelude", () => {
    const prelude = buildDiaryPreludeMeta({
      weatherCode: "sunny",
      moodCode: "calm",
    });

    expect(shouldRenderDiaryPreludeHeaderMeta("edit", "selected", prelude)).toBe(true);
    expect(shouldRenderDiaryPreludeHeaderMeta("read", "selected", prelude)).toBe(true);
    expect(shouldRenderDiaryPreludeHeaderMeta("edit", "skipped", null)).toBe(false);
    expect(shouldRenderDiaryPreludeHeaderMeta("edit", "unseen", null)).toBe(false);
  });

  it("only allows editing selected diary prelude in edit mode", () => {
    expect(shouldAllowDiaryPreludeEdit("edit", "selected")).toBe(true);
    expect(shouldAllowDiaryPreludeEdit("read", "selected")).toBe(false);
    expect(shouldAllowDiaryPreludeEdit("edit", "skipped")).toBe(false);
    expect(shouldAllowDiaryPreludeEdit("edit", "unseen")).toBe(false);
  });
});
