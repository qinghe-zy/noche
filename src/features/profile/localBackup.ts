import { getDraftRepository } from "@/app/store/useDraftStore";
import { getEntryRepository } from "@/app/store/entryRepository";
import { readStoredPreferenceMap } from "@/data/repositories/storagePrefsRepository";
import { SQLITE_DB_NAME, SQLITE_DB_PATH } from "@/data/db/schema";
import { createUniJsonStorage } from "@/shared/utils/storage";
import {
  collectManagedLocalAttachmentPaths,
  collectManagedLocalResourcePaths,
} from "@/shared/utils/localFiles";
import { nowIso } from "@/shared/utils/date";

const BACKUP_ROOT = "_documents/noche-backups";
const MANIFEST_NAME = "manifest.json";
const PREFS_BACKUP_FILE = "storage/preferences.json";
const DRAFT_SHADOW_BACKUP_FILE = "storage/draft-shadow.json";
const SQLITE_BACKUP_FILE = "db/noche.db";

interface BackupManifestAsset {
  originalUri: string;
  backupRelativePath: string;
}

interface BackupManifest {
  version: 1;
  createdAt: string;
  backupId: string;
  dbRelativePath: string;
  prefsRelativePath: string;
  draftShadowRelativePath: string;
  assets: BackupManifestAsset[];
}

export interface LocalBackupSummary {
  backupId: string;
  createdAt: string;
  absolutePath: string;
}

export function isLocalBackupAvailable(): boolean {
  return isAppPlusRuntime();
}

function isAppPlusRuntime(): boolean {
  return typeof plus !== "undefined" && Boolean(plus.io);
}

function sanitizeBackupSegment(segment: string): string {
  return segment.replace(/[:*?"<>|\\]/gu, "_");
}

function toAbsoluteBackupPath(relativePath: string): string {
  return `${BACKUP_ROOT}/${relativePath}`.replace(/\/+/gu, "/");
}

function buildBackupFilePath(backupId: string, relativePath: string): string {
  return toAbsoluteBackupPath(`${backupId}/${relativePath}`);
}

function toDisplayPath(path: string): string {
  if (
    typeof plus !== "undefined"
    && plus.io
    && typeof plus.io.convertLocalFileSystemURL === "function"
    && /^(_doc\/|_documents\/)/iu.test(path)
  ) {
    try {
      return plus.io.convertLocalFileSystemURL(path) || path;
    } catch {
      return path;
    }
  }

  return path;
}

function toBackupRelativePath(originalUri: string): string {
  const normalized = originalUri.replace(/^file:\/\//iu, "");
  const cleaned = normalized.replace(/^\/+/u, "");
  return `files/${cleaned.split("/").map(sanitizeBackupSegment).join("/")}`;
}

function getStorageMap(): Record<string, string> {
  const storage = createUniJsonStorage();
  return {
    preferences: storage.getString("noche.preferences.v1") ?? "{}",
    draftShadow: storage.getString("noche.editor-draft-shadow.v1") ?? "{}",
  };
}

function collectManagedBackupAssets(
  entries: Awaited<ReturnType<ReturnType<typeof getEntryRepository>["getAllActive"]>>,
  drafts: Awaited<ReturnType<ReturnType<typeof getDraftRepository>["getAll"]>>,
): string[] {
  const prefs = readStoredPreferenceMap(createUniJsonStorage());
  const entryAttachmentPaths = entries.flatMap((entry) => collectManagedLocalAttachmentPaths(entry.attachments));
  const draftAttachmentPaths = drafts.flatMap((draft) => collectManagedLocalAttachmentPaths(draft.attachments));
  const profilePaths = collectManagedLocalResourcePaths([
    prefs["profile.avatarUri"],
    prefs["profile.coverUri"],
  ]);

  return Array.from(new Set([...entryAttachmentPaths, ...draftAttachmentPaths, ...profilePaths]));
}

async function resolveEntry(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(url, resolve, reject);
  }).catch((error) => {
    const message = error instanceof Error
      ? error.message
      : typeof (error as { message?: unknown } | undefined)?.message === "string"
        ? (error as { message: string }).message
        : String(error ?? "Unknown filesystem error");
    throw new Error(`resolveLocalFileSystemURL failed for ${url}: ${message}`);
  });
}

async function ensureDirectory(relativePath: string): Promise<any> {
  const segments = relativePath.split("/").filter(Boolean);
  let current = await resolveEntry("_documents/");

  if (relativePath.startsWith("_doc/")) {
    current = await resolveEntry("_doc/");
    segments.shift();
  } else if (relativePath.startsWith("_documents/")) {
    segments.shift();
  }

  for (const segment of segments) {
    current = await new Promise((resolve, reject) => {
      current.getDirectory(segment, { create: true }, resolve, reject);
    });
  }

  return current;
}

async function ensureParentDirectory(filePath: string): Promise<any> {
  const parentPath = filePath.split("/").slice(0, -1).join("/");
  return ensureDirectory(parentPath);
}

async function removeEntryIfExists(url: string): Promise<void> {
  try {
    const entry = await resolveEntry(url);
    await new Promise<void>((resolve, reject) => {
      if (entry.isDirectory) {
        entry.removeRecursively(() => resolve(), reject);
        return;
      }

      entry.remove(() => resolve(), reject);
    });
  } catch {
    // noop
  }
}

async function writeTextFile(absolutePath: string, content: string): Promise<void> {
  const parent = await ensureParentDirectory(absolutePath);
  const fileName = absolutePath.split("/").pop() ?? "file.txt";
  const fileEntry = await new Promise<any>((resolve, reject) => {
    parent.getFile(fileName, { create: true }, resolve, reject);
  });
  const writer = await new Promise<any>((resolve, reject) => {
    fileEntry.createWriter(resolve, reject);
  });

  await new Promise<void>((resolve, reject) => {
    writer.onwrite = () => resolve();
    writer.onerror = reject;
    writer.write(content);
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error ?? "Unknown write error");
    throw new Error(`Failed to write backup file ${absolutePath}: ${message}`);
  });
}

async function copyFile(sourceUri: string, targetAbsolutePath: string): Promise<void> {
  const sourceEntry = await resolveEntry(sourceUri);
  const parentDir = await ensureParentDirectory(targetAbsolutePath);
  const targetName = targetAbsolutePath.split("/").pop() ?? "file";

  await removeEntryIfExists(targetAbsolutePath);

  await new Promise<void>((resolve, reject) => {
    sourceEntry.copyTo(parentDir, targetName, () => resolve(), reject);
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error ?? "Unknown copy error");
    throw new Error(`Failed to copy ${sourceUri} -> ${targetAbsolutePath}: ${message}`);
  });
}

async function copyBackupFileToOriginal(sourceRelativePath: string, originalUri: string): Promise<void> {
  const sourceEntry = await resolveEntry(sourceRelativePath);
  const parentDir = await ensureParentDirectory(originalUri);
  const fileName = originalUri.split("/").pop() ?? "file";

  await removeEntryIfExists(originalUri);

  await new Promise<void>((resolve, reject) => {
    sourceEntry.copyTo(parentDir, fileName, () => resolve(), reject);
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error ?? "Unknown restore copy error");
    throw new Error(`Failed to restore ${sourceRelativePath} -> ${originalUri}: ${message}`);
  });
}

async function readTextFile(absolutePath: string): Promise<string> {
  const entry = await resolveEntry(absolutePath);
  const file = await new Promise<any>((resolve, reject) => entry.file(resolve, reject));
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readBackupManifest(backupId: string): Promise<BackupManifest> {
  const raw = await readTextFile(buildBackupFilePath(backupId, MANIFEST_NAME));
  return JSON.parse(raw) as BackupManifest;
}

function closeSQLiteIfOpen(): void {
  if (typeof plus === "undefined" || !plus.sqlite) {
    return;
  }

  try {
    const isOpen = plus.sqlite.isOpenDatabase({
      name: SQLITE_DB_NAME,
      path: SQLITE_DB_PATH,
    });

    if (isOpen) {
      plus.sqlite.closeDatabase({
        name: SQLITE_DB_NAME,
      });
    }
  } catch {
    // noop
  }
}

function reopenSQLiteIfNeeded(): void {
  if (typeof plus === "undefined" || !plus.sqlite) {
    return;
  }

  try {
    const isOpen = plus.sqlite.isOpenDatabase({
      name: SQLITE_DB_NAME,
      path: SQLITE_DB_PATH,
    });

    if (isOpen) {
      return;
    }

    plus.sqlite.openDatabase({
      name: SQLITE_DB_NAME,
      path: SQLITE_DB_PATH,
      success: () => undefined,
      fail: () => undefined,
    });
  } catch {
    // noop
  }
}

export async function listLocalBackups(): Promise<LocalBackupSummary[]> {
  if (!isAppPlusRuntime()) {
    return [];
  }

  try {
    const rootEntry = await ensureDirectory(BACKUP_ROOT);
    const entries = await new Promise<any[]>((resolve, reject) => {
      rootEntry.createReader().readEntries(resolve, reject);
    });

    const summaries = (
      await Promise.all(
        entries
          .filter((entry) => entry.isDirectory)
          .map(async (entry) => {
            try {
              const manifest = await readBackupManifest(entry.name);
              return {
                backupId: manifest.backupId,
                createdAt: manifest.createdAt,
                absolutePath: toDisplayPath(`${BACKUP_ROOT}/${entry.name}`),
              } satisfies LocalBackupSummary;
            } catch {
              return null;
            }
          }),
      )
    ).filter((item): item is LocalBackupSummary => Boolean(item));

    return summaries.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch {
    return [];
  }
}

export async function exportLocalBackup(): Promise<LocalBackupSummary> {
  if (!isAppPlusRuntime()) {
    throw new Error("Local backup is only available in app-plus runtime.");
  }

  const createdAt = nowIso();
  const backupId = createdAt.replace(/[:.]/gu, "-");
  const backupDir = `${BACKUP_ROOT}/${backupId}`;
  const entries = await getEntryRepository().getAllActive();
  const drafts = await getDraftRepository().getAll();
  const managedAssets = collectManagedBackupAssets(entries, drafts);
  const storageMap = getStorageMap();
  const manifest: BackupManifest = {
    version: 1,
    createdAt,
    backupId,
    dbRelativePath: SQLITE_BACKUP_FILE,
    prefsRelativePath: PREFS_BACKUP_FILE,
    draftShadowRelativePath: DRAFT_SHADOW_BACKUP_FILE,
    assets: managedAssets.map((originalUri) => ({
      originalUri,
      backupRelativePath: toBackupRelativePath(originalUri),
    })),
  };

  await ensureDirectory(backupDir);

  try {
    closeSQLiteIfOpen();
    await copyFile(SQLITE_DB_PATH, buildBackupFilePath(backupId, SQLITE_BACKUP_FILE));
    await writeTextFile(buildBackupFilePath(backupId, PREFS_BACKUP_FILE), storageMap.preferences);
    await writeTextFile(buildBackupFilePath(backupId, DRAFT_SHADOW_BACKUP_FILE), storageMap.draftShadow);

    for (const asset of manifest.assets) {
      await copyFile(asset.originalUri, buildBackupFilePath(backupId, asset.backupRelativePath));
    }

    await writeTextFile(buildBackupFilePath(backupId, MANIFEST_NAME), JSON.stringify(manifest, null, 2));

    return {
      backupId,
      createdAt,
      absolutePath: toDisplayPath(backupDir),
    };
  } finally {
    reopenSQLiteIfNeeded();
  }
}

export async function importLocalBackup(backupId: string): Promise<void> {
  if (!isAppPlusRuntime()) {
    throw new Error("Local restore is only available in app-plus runtime.");
  }

  const manifest = await readBackupManifest(backupId);
  const storage = createUniJsonStorage();

  try {
    closeSQLiteIfOpen();
    await copyBackupFileToOriginal(buildBackupFilePath(backupId, manifest.dbRelativePath), SQLITE_DB_PATH);

    for (const asset of manifest.assets) {
      await copyBackupFileToOriginal(buildBackupFilePath(backupId, asset.backupRelativePath), asset.originalUri);
    }

    storage.setString("noche.preferences.v1", await readTextFile(buildBackupFilePath(backupId, manifest.prefsRelativePath)));
    storage.setString("noche.editor-draft-shadow.v1", await readTextFile(buildBackupFilePath(backupId, manifest.draftShadowRelativePath)));
  } finally {
    reopenSQLiteIfNeeded();
  }
}

export function restartAppAfterRestore(): void {
  if (typeof plus !== "undefined" && plus.runtime?.restart) {
    plus.runtime.restart();
  }
}
