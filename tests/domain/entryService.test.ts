import { describe, expect, it } from "vitest";
import { createEntry, destroyEntry } from "@/domain/services/entryService";

describe("entry service", () => {
  it("creates saved diary entries with final tech model fields", () => {
    const entry = createEntry({
      type: "diary",
      content: "今天写一封信",
      recordDate: "2026-04-10",
    });

    expect(entry.type).toBe("diary");
    expect(entry.status).toBe("saved");
    expect(entry.recordDate).toBe("2026-04-10");
    expect(entry.unlockDate).toBeNull();
    expect(entry.savedAt).toBeNull();
    expect(entry.unlockedAt).toBeNull();
    expect(entry.destroyedAt).toBeNull();
  });

  it("creates future letters as sealed entries with unlockDate", () => {
    const entry = createEntry({
      type: "future",
      content: "明天见",
      unlockDate: "2026-04-11",
    });

    expect(entry.type).toBe("future");
    expect(entry.status).toBe("sealed");
    expect(entry.unlockDate).toBe("2026-04-11");
  });

  it("marks destroyed entries through the destroyEntry use case", async () => {
    const entry = createEntry({
      type: "jotting",
      content: "需要销毁的随笔",
    });

    const destroyed = await destroyEntry(entry);

    expect(destroyed.destroyedAt).toEqual(expect.any(String));
  });
});
