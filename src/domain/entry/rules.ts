import type { Entry } from "./types";
import type { Attachment } from "@/shared/types/attachment";

type EntryContentLike = Pick<Entry, "title" | "content" | "attachments">;

function hasAttachments(input: Partial<Pick<Entry, "attachments">>): boolean {
  return Array.isArray(input.attachments) && input.attachments.length > 0;
}

export function isEntryEmpty(input: Partial<EntryContentLike>): boolean {
  const title = (input.title ?? "").trim();
  const content = (input.content ?? "").trim();

  return title.length === 0 && content.length === 0 && !hasAttachments(input);
}

export function canPersistEntry(input: Partial<EntryContentLike>): boolean {
  return (input.content ?? "").trim().length > 0 || hasAttachments(input);
}

export function normalizeAttachments(
  attachments: Attachment[] | null | undefined,
): Attachment[] {
  return Array.isArray(attachments)
    ? attachments
        .filter((attachment) => attachment.type === "image" && attachment.localUri.trim().length > 0)
        .sort((left, right) => left.sortOrder - right.sortOrder)
    : [];
}
