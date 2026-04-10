import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import type { Entry } from "@/domain/entry/types";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { setEntryRepository } from "@/app/store/useEntryStore";
import { useMailboxStore } from "@/app/store/useMailboxStore";

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

describe("mailbox store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T08:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches past and sealed future entries without leaking locked letters into past", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-1",
        type: "diary",
        recordDate: "2026-04-10",
      }),
      makeEntry({
        id: "jotting-1",
        type: "jotting",
        recordDate: "2026-04-11",
      }),
      makeEntry({
        id: "future-open",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-08",
        unlockDate: "2026-04-10",
      }),
      makeEntry({
        id: "future-locked",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-12",
        unlockDate: "2026-04-14",
      }),
    ]);
    setEntryRepository(repository);
    const store = useMailboxStore();

    await store.fetchPastEntries();
    await store.fetchSealedFutureEntries();

    expect(store.pastEntries.map((entry) => entry.id)).toEqual([
      "jotting-1",
      "diary-1",
      "future-open",
    ]);
    expect(store.sealedFutureEntries.map((entry) => entry.id)).toEqual(["future-locked"]);
    expect(store.pendingFutureEntries.map((entry) => entry.id)).toEqual(["future-locked"]);

    const persisted = await repository.getById("future-open");
    expect(persisted?.status).toBe("unlocked");
    expect(persisted?.unlockedAt).toBe("2026-04-11T08:00:00.000Z");
  });

  it("returns a materialized future entry by id", async () => {
    const repository = createMemoryEntryRepository([
      makeEntry({
        id: "future-open",
        type: "future",
        status: "sealed",
        recordDate: "2026-04-08",
        unlockDate: "2026-04-10",
      }),
    ]);
    setEntryRepository(repository);
    const store = useMailboxStore();

    const entry = await store.fetchEntryById("future-open");

    expect(entry).toMatchObject({
      id: "future-open",
      status: "unlocked",
    });
  });
});
