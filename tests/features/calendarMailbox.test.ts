import { describe, expect, it } from "vitest";
import type { Entry } from "@/domain/entry/types";
import { resolveCalendarMailboxState } from "@/features/calendar/calendarMailbox";

function makeEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "entry-1",
    type: overrides.type ?? "diary",
    status: overrides.status ?? "saved",
    title: overrides.title ?? null,
    content: overrides.content ?? "content",
    recordDate: overrides.recordDate ?? "2026-04-10",
    createdAt: overrides.createdAt ?? "2026-04-10T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-10T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-10T08:00:00.000Z",
    unlockDate: overrides.unlockDate ?? null,
    unlockedAt: overrides.unlockedAt ?? null,
    destroyedAt: overrides.destroyedAt ?? null,
  };
}

describe("calendar mailbox", () => {
  it("returns entries state when that day has content", () => {
    const state = resolveCalendarMailboxState(
      "2026-04-10",
      [makeEntry({ type: "diary" })],
      "2026-04-11",
      0,
    );

    expect(state.kind).toBe("entries");
    expect(state.actionLabel).toBeNull();
    expect(state.title).toBe("这一天，落笔有痕。");
    expect(state.body).toContain("2026.04.10");
  });

  it("returns an empty-past state with a diary action", () => {
    const state = resolveCalendarMailboxState("2026-04-09", [], "2026-04-11", 1);

    expect(state.kind).toBe("empty-past");
    expect(state.actionLabel).toBe("补写这一天的日记");
    expect(state.title).toBe("纸笺泛白，静候回音。");
    expect(state.body).toContain("2026.04.09");
  });

  it("returns an empty-today state with the today action", () => {
    const state = resolveCalendarMailboxState("2026-04-11", [], "2026-04-11", 2);

    expect(state.kind).toBe("empty-today");
    expect(state.actionLabel).toBe("打开今日信纸");
    expect(state.title).toBe("光阴无声，此页空缺。");
    expect(state.body).toContain("2026.04.11");
  });

  it("returns an empty-future state without a diary action", () => {
    const state = resolveCalendarMailboxState("2026-04-13", [], "2026-04-11");

    expect(state.kind).toBe("empty-future");
    expect(state.actionLabel).toBeNull();
  });
});
