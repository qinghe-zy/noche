import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it } from "vitest";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { useDraftStore } from "@/app/store/useDraftStore";
import { useSettingsStore } from "@/app/store/useSettingsStore";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import { createDraft } from "@/domain/services/draftService";

describe("configurePersistenceAdapters", () => {
  it("wires draft, entry, and prefs repositories through one provider seam", async () => {
    setActivePinia(createPinia());
    const seededDraft = {
      ...createDraft({ type: "diary", recordDate: "2026-04-10" }),
      title: "seeded",
      content: "seeded content",
    };

    configurePersistenceAdapters({
      draftRepository: createMemoryDraftRepository([seededDraft]),
      entryRepository: createMemoryEntryRepository(),
      prefsRepository: createMemoryPrefsRepository([
        { key: "theme", value: "dark" },
      ]),
    });

    const draftStore = useDraftStore();
    const settingsStore = useSettingsStore();

    const restored = await draftStore.openDraft({
      type: "diary",
      recordDate: "2026-04-10",
    });
    await settingsStore.hydrate();

    expect(restored.title).toBe("seeded");
    expect(settingsStore.theme).toBe("dark");
  });
});
