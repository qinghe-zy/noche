import { describe, expect, it } from "vitest";
import { createDraft } from "@/domain/services/draftService";
import { buildDiaryDraftKey, buildDraftSlotKey } from "@/domain/draft/rules";
import { DRAFT_KEYS } from "@/shared/constants/draftKeys";

describe("draft slot rules", () => {
  it("uses the shared diary slot convention for date-scoped diary drafts", () => {
    const recordDate = "2026-04-10";

    expect(buildDiaryDraftKey(recordDate)).toBe(DRAFT_KEYS.diary(recordDate));
    expect(buildDraftSlotKey("diary", { recordDate })).toBe(DRAFT_KEYS.diary(recordDate));
    expect(createDraft({ type: "diary", recordDate }).slotKey).toBe(DRAFT_KEYS.diary(recordDate));
  });

  it("uses one active slot for jotting drafts and one separate slot for future letters", () => {
    expect(buildDraftSlotKey("jotting")).toBe(DRAFT_KEYS.JOTTING);
    expect(createDraft({ type: "jotting" }).slotKey).toBe(DRAFT_KEYS.JOTTING);

    expect(buildDraftSlotKey("future")).toBe(DRAFT_KEYS.FUTURE);
    expect(createDraft({ type: "future" }).slotKey).toBe(DRAFT_KEYS.FUTURE);
  });
});
