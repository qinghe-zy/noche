import { describe, expect, it } from "vitest";
import { buildDarkMailboxList } from "@/features/dark-shell/darkMailboxView";

describe("darkMailboxView", () => {
  it("merges mailbox collections into a single date-sorted list", () => {
    const result = buildDarkMailboxList({
      documentaryDiaries: [
        { id: "d1", recordDate: "2026-04-20", createdAt: "2026-04-20T08:00:00.000Z", savedAt: "2026-04-20T08:00:00.000Z" },
      ],
      documentaryJottings: [],
      distantOpenedFutures: [
        { id: "f1", recordDate: "2026-04-19", createdAt: "2026-04-19T08:00:00.000Z", savedAt: "2026-04-19T08:00:00.000Z" },
      ],
      distantPendingFutures: [],
    } as any);

    expect(result.map((item) => item.id)).toEqual(["d1", "f1"]);
  });
});
