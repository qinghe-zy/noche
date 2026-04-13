export type AttachmentType = "image";

export interface Attachment {
  id: string;
  type: AttachmentType;
  entryId: string | null;
  draftKey: string | null;
  localUri: string;
  sortOrder: number;
  createdAt: string;
  width?: number | null;
  height?: number | null;
}
