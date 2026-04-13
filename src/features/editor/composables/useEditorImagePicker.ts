import type { Attachment } from "@/shared/types/attachment";
import { createId } from "@/shared/utils/id";
import { nowIso } from "@/shared/utils/date";

interface ChooseImageFileLike {
  path?: string;
  size?: number;
  name?: string;
  type?: string;
}

interface ChooseImageResult {
  tempFilePaths?: string[];
  tempFiles?: Array<File | ChooseImageFileLike>;
}

interface PickImagesOptions {
  draftKey: string;
  startSortOrder?: number;
  sourceType: "album" | "camera";
}

function chooseImages(sourceType: "album" | "camera"): Promise<ChooseImageResult> {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 9,
      sizeType: ["compressed", "original"],
      sourceType: [sourceType],
      success: (result) => resolve(result as ChooseImageResult),
      fail: reject,
    });
  });
}

function saveFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.saveFile({
      tempFilePath,
      success: (result) => resolve((result as { savedFilePath: string }).savedFilePath),
      fail: reject,
    });
  });
}

function getImageInfo(src: string): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    uni.getImageInfo({
      src,
      success: (result) => {
        const imageInfo = result as { width?: number; height?: number };
        resolve({
          width: imageInfo.width,
          height: imageInfo.height,
        });
      },
      fail: () => resolve({}),
    });
  });
}

function isBrowserFile(value: unknown): value is File {
  return typeof File !== "undefined" && value instanceof File;
}

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read image file."));
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

async function persistLocalUri(
  tempFilePath: string,
  tempFile: File | ChooseImageFileLike | undefined,
): Promise<string> {
  if (typeof uni !== "undefined" && typeof uni.saveFile === "function") {
    try {
      return await saveFile(tempFilePath);
    } catch {
      // H5 and some runtimes do not support saveFile; fall back to local data.
    }
  }

  if (isBrowserFile(tempFile)) {
    return toDataUrl(tempFile);
  }

  return tempFilePath;
}

export function useEditorImagePicker() {
  return {
    async pickImages(options: PickImagesOptions): Promise<Attachment[]> {
      const result = await chooseImages(options.sourceType);
      const tempFilePaths = result.tempFilePaths ?? [];
      const tempFiles = result.tempFiles ?? [];

      const attachments = await Promise.all(
        tempFilePaths.map(async (tempFilePath, index) => {
          const localUri = await persistLocalUri(tempFilePath, tempFiles[index]);
          const dimensions = await getImageInfo(localUri);

          return {
            id: createId(),
            type: "image" as const,
            draftKey: options.draftKey,
            entryId: null,
            localUri,
            sortOrder: (options.startSortOrder ?? 0) + index,
            createdAt: nowIso(),
            width: dimensions.width ?? null,
            height: dimensions.height ?? null,
          };
        }),
      );

      return attachments;
    },
  };
}
