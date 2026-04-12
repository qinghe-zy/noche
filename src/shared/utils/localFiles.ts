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

export function collectManagedLocalResourcePaths(
  localUris: Array<string | null | undefined>,
): string[] {
  return localUris
    .map((localUri) => localUri?.trim() ?? "")
    .filter(isManagedLocalFile);
}

function normalizeFileProtocol(localUri: string): string {
  if (/^file:\/\//iu.test(localUri)) {
    return localUri;
  }

  if (/^(\/storage\/|\/var\/mobile\/|\/data\/user\/|\/data\/data\/)/iu.test(localUri)) {
    return `file://${localUri}`;
  }

  return localUri;
}

export function normalizeLocalImageSrc(localUri: string | null | undefined): string {
  const trimmed = localUri?.trim() ?? "";

  if (!trimmed) {
    return "";
  }

  if (/^(data:|https?:|blob:)/iu.test(trimmed)) {
    return trimmed;
  }

  if (
    typeof plus !== "undefined"
    && plus.io
    && typeof plus.io.convertLocalFileSystemURL === "function"
    && /^(_doc\/|_documents\/)/iu.test(trimmed)
  ) {
    try {
      const converted = plus.io.convertLocalFileSystemURL(trimmed);
      return normalizeFileProtocol(converted || trimmed);
    } catch {
      return trimmed;
    }
  }

  return normalizeFileProtocol(trimmed);
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
