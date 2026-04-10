import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createEntry } from "@/domain/services/entryService";
import { setEntryRepository, useEntryStore } from "@/app/store/useEntryStore";

describe("entry store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    setEntryRepository(createMemoryEntryRepository());
  });

  it("persists entries through the configured repository", async () => {
    const store = useEntryStore();
    const entry = createEntry({ type: "diary", content: "store entry", recordDate: "2026-04-10" });

    await store.saveEntry(entry);
    await store.fetchEntriesByDate("2026-04-10");

    expect(store.entryList).toEqual([entry]);

    await store.destroyEntry(entry.id);

    expect(store.entryList).toEqual([]);
  });
});
