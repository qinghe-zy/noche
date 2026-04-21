import type { EntryMailboxCollections } from "@/data/repositories/entry.repository";
import type { Entry } from "@/domain/entry/types";

export function buildDarkMailboxList(collections: EntryMailboxCollections): Entry[] {
  return [
    ...collections.distantOpenedFutures,
    ...collections.distantPendingFutures,
    ...collections.documentaryDiaries,
    ...collections.documentaryJottings,
  ].sort((a, b) => (b.savedAt ?? b.createdAt).localeCompare(a.savedAt ?? a.createdAt));
}
