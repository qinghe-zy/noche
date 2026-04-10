import { describe, expect, it } from "vitest";
import { useDraftStore } from "@/app/store/useDraftStore";
import { useEntryStore } from "@/app/store/useEntryStore";
import { useDraftStore as useDraftStoreAlias } from "@/app/store/draft.store";
import { useEntryStore as useEntryStoreAlias } from "@/app/store/entry.store";

describe("store aliases", () => {
  it("does not define duplicate Pinia stores for legacy filenames", () => {
    expect(useEntryStoreAlias).toBe(useEntryStore);
    expect(useDraftStoreAlias).toBe(useDraftStore);
  });
});
