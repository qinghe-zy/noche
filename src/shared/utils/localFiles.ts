import type { Attachment } from "@/shared/types/attachment";

function isManagedLocalFile(localUri: string): boolean {
  const trimmed = localUri.trim();

  if (!trimmed) {
    return false;
  }

  if (/^(data:|https?:)/iu.test(trimmed)) {
    return false;
  }

  return /^(_doc\/|_documents\/|file:\/\/|\/storage\/|\/var\/mobile\/)/iu.test(trimmed);
}

export function collectManagedLocalAttachmentPaths(
  attachments: Attachment[] | null | undefined,
): string[] {
  return (attachments ?? [])
    .map((attachment) => attachment.localUri)
    .filter(isManagedLocalFile);
}

export async function removeManagedLocalFiles(paths: string[]): Promise<void> {
  if (!paths.length || typeof uni === "undefined" || typeof uni.removeSavedFile !== "function") {
    return;
  }

  for (const filePath of paths) {
    await new Promise<void>((resolve, reject) => {
      uni.removeSavedFile({
        filePath,
        success: () => resolve(),
        fail: (error) => {
          const maybeMessage = error as { errMsg?: string } | undefined;
          const message = maybeMessage?.errMsg ?? "";

          if (/not exists|no such file|不存在/iu.test(message)) {
            resolve();
            return;
          }

          reject(error);
        },
      });
    });
  }
}
