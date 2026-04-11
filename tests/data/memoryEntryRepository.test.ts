import { describe, expect, it } from "vitest";
import { createEntry } from "@/domain/services/entryService";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";

describe("memory entry repository", () => {
  it("saves, queries, sorts, and deletes active entries", async () => {
    const repository = createMemoryEntryRepository();
    const older = createEntry({ type: "diary", content: "older", recordDate: "2026-04-09" });
    const newer = createEntry({ type: "jotting", content: "newer", recordDate: "2026-04-10" });
    const future = createEntry({
      type: "future",
      content: "future",
      recordDate: "2026-04-08",
      unlockDate: "2026-04-11",
    });

    await repository.save(older);
    await repository.save(newer);
    await repository.save(future);

    expect((await repository.getAllActive()).map((entry) => entry.id)).toEqual([
      newer.id,
      older.id,
      future.id,
    ]);
    expect(await repository.getByType("future")).toEqual([future]);
    expect(await repository.getCalendarMarkedDates()).toEqual(["2026-04-09", "2026-04-10"]);
    expect(await repository.getProfileStats()).toEqual({
      recordedDays: 3,
      totalWords: "oldernewerfuture".length,
      diaryCount: 1,
    });

    await repository.deleteById(newer.id);

    expect(await repository.getById(newer.id)).toBeNull();
  });
});
