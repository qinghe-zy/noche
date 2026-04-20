import { describe, expect, it } from "vitest";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import type { Entry } from "@/domain/entry/types";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { collectRecentDiaryPreludeContext } from "@/features/home/homeWelcomeCardRemoteContext";

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
    diaryPreludeStatus: overrides.diaryPreludeStatus ?? "selected",
    diaryPrelude: "diaryPrelude" in overrides
      ? (overrides.diaryPrelude ?? null)
      : buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: "calm",
        }),
  };
}

describe("home welcome card remote context", () => {
  it("summarizes recent diary weather and mood selections for prompt use", async () => {
    const entryRepository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-1",
        recordDate: "2026-04-19",
        createdAt: "2026-04-19T09:00:00.000Z",
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "rainy",
          moodCode: "anxious",
        }),
      }),
      makeEntry({
        id: "diary-2",
        recordDate: "2026-04-18",
        createdAt: "2026-04-18T09:00:00.000Z",
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: "calm",
        }),
      }),
      makeEntry({
        id: "diary-3",
        recordDate: "2026-04-17",
        createdAt: "2026-04-17T09:00:00.000Z",
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: "calm",
        }),
      }),
      makeEntry({
        id: "jotting-ignored",
        type: "jotting",
        diaryPreludeStatus: "skipped",
        diaryPrelude: null,
      }),
    ]);

    const result = await collectRecentDiaryPreludeContext(entryRepository);

    expect(result).toEqual({
      sampleCount: 3,
      latestWeatherCode: "rainy",
      latestMoodCode: "anxious",
      dominantWeatherCode: "cloudy",
      dominantMoodCode: "calm",
    });
  });

  it("returns null when there is no usable diary prelude history", async () => {
    const entryRepository = createMemoryEntryRepository([
      makeEntry({
        id: "diary-empty",
        diaryPreludeStatus: "skipped",
        diaryPrelude: null,
      }),
    ]);

    expect(await collectRecentDiaryPreludeContext(entryRepository)).toBeNull();
  });
});
