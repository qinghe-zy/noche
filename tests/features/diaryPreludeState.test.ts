import { describe, expect, it } from "vitest";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import {
  shouldOpenDiaryPreludePicker,
  shouldRenderDiaryPreludeInlineCard,
} from "@/features/editor/diaryPreludeState";

describe("diary prelude state", () => {
  it("opens the picker for diary edit flows without prelude metadata", () => {
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "edit",
        diaryPrelude: null,
      }),
    ).toBe(true);
  });

  it("does not open the picker for read mode or non-diary types", () => {
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "diary",
        mode: "read",
        diaryPrelude: null,
      }),
    ).toBe(false);
    expect(
      shouldOpenDiaryPreludePicker({
        entryType: "jotting",
        mode: "edit",
        diaryPrelude: null,
      }),
    ).toBe(false);
  });

  it("renders the inline card in read mode only when prelude metadata exists", () => {
    const prelude = buildDiaryPreludeMeta({
      weatherCode: "sunny",
      moodCode: "calm",
    });

    expect(shouldRenderDiaryPreludeInlineCard("edit", null)).toBe(true);
    expect(shouldRenderDiaryPreludeInlineCard("read", prelude)).toBe(true);
    expect(shouldRenderDiaryPreludeInlineCard("read", null)).toBe(false);
  });
});
