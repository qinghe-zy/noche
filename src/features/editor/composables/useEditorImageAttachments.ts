import { ref } from "vue";
import type { Attachment } from "@/shared/types/attachment";
import { normalizeAttachments } from "@/domain/entry/rules";

export function useEditorImageAttachments() {
  const attachments = ref<Attachment[]>([]);

  function replaceAttachments(nextAttachments: Attachment[] | null | undefined): void {
    attachments.value = normalizeAttachments(nextAttachments);
  }

  function appendAttachments(nextAttachments: Attachment[]): void {
    const merged = normalizeAttachments([
      ...attachments.value,
      ...nextAttachments.map((attachment, index) => ({
        ...attachment,
        sortOrder: attachments.value.length + index,
      })),
    ]);

    attachments.value = merged.map((attachment, index) => ({
      ...attachment,
      sortOrder: index,
    }));
  }

  function removeAttachment(attachmentId: string): Attachment[] {
    attachments.value = attachments.value
      .filter((attachment) => attachment.id !== attachmentId)
      .map((attachment, index) => ({
        ...attachment,
        sortOrder: index,
      }));

    return attachments.value;
  }

  function clearAttachments(): void {
    attachments.value = [];
  }

  function previewAttachments(startAttachmentId?: string): void {
    if (!attachments.value.length) {
      return;
    }

    const urls = attachments.value.map((attachment) => attachment.localUri);
    const startIndex = startAttachmentId
      ? attachments.value.findIndex((attachment) => attachment.id === startAttachmentId)
      : 0;

    uni.previewImage({
      urls,
      current: startIndex >= 0 ? startIndex : 0,
    });
  }

  return {
    attachments,
    replaceAttachments,
    appendAttachments,
    removeAttachment,
    clearAttachments,
    previewAttachments,
  };
}
