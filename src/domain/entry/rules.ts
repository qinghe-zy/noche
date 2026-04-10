import type { Entry } from "./types";

type EntryContentLike = Pick<Entry, "title" | "content">;

export function isEntryEmpty(input: Partial<EntryContentLike>): boolean {
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();

  return title.length === 0 && content.length === 0;
}

export function canPersistEntry(input: Partial<EntryContentLike>): boolean {
  return !isEntryEmpty(input);
}
