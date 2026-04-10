import type { Draft } from "@/domain/draft/types";
import type { Entry } from "@/domain/entry/types";

export type DiaryOpenTarget =
  | { kind: "draft"; slotKey: string }
  | { kind: "entry"; entryId: string }
  | { kind: "new-draft"; recordDate: string };

interface ResolveDiaryEntryOpenTargetInput {
  draft: Draft | null;
  entries: Entry[];
  recordDate: string;
}

export function resolveDiaryEntryOpenTarget(
  input: ResolveDiaryEntryOpenTargetInput,
): DiaryOpenTarget {
  if (input.draft) {
    return {
      kind: "draft",
      slotKey: input.draft.slotKey,
    };
  }

  const savedDiary = input.entries.find((entry) => entry.type === "diary");
  if (savedDiary) {
    return {
      kind: "entry",
      entryId: savedDiary.id,
    };
  }

  return {
    kind: "new-draft",
    recordDate: input.recordDate,
  };
}
