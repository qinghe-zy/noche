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

export const DEFAULT_LOCAL_BACKUP_ROOT = "_documents/noche-backups";
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

interface BackupAssetExportPlan {
  assets: BackupManifestAsset[];
  skippedOriginalUris: string[];
}

export type LocalBackupErrorCode =
  | "runtime_unavailable"
  | "backup_root_invalid"
  | "backup_root_unwritable"
  | "backup_database_unavailable"
  | "backup_manifest_invalid"
  | "backup_bundle_missing"
  | "backup_write_failed"
  | "backup_restore_failed";

interface LocalBackupError extends Error {
  code: LocalBackupErrorCode;
  cause?: unknown;
}

export interface LocalBackupSummary {
  backupId: string;
  createdAt: string;
  absolutePath: string;
  backupRoot: string;
  skippedAssetCount?: number;
}

export interface LocalBackupOptions {
  backupRoot?: string | null;
}

function createLocalBackupError(
  code: LocalBackupErrorCode,
  message: string,
  cause?: unknown,
): LocalBackupError {
  const error = new Error(message) as LocalBackupError;
  error.code = code;
  error.cause = cause;
  return error;
}

export function getLocalBackupErrorCode(error: unknown): LocalBackupErrorCode | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: LocalBackupErrorCode }).code ?? null;
  }

  return null;
}

export function isLocalBackupAvailable(): boolean {
  return isAppPlusRuntime();
}

function isAppPlusRuntime(): boolean {
  if (typeof plus !== "undefined" && Boolean(plus.io)) {
    return true;
  }

  if (typeof navigator !== "undefined") {
    return /Html5Plus/iu.test(navigator.userAgent);
  }

  return false;
}

function sanitizeBackupSegment(segment: string): string {
  return segment.replace(/[:*?"<>|\\]/gu, "_");
}

export function normalizeLocalBackupRoot(backupRoot?: string | null): string {
  const trimmed = backupRoot?.trim() ?? "";

  if (!trimmed) {
    return DEFAULT_LOCAL_BACKUP_ROOT;
  }

  const normalized = trimmed
    .replace(/\\/gu, "/")
    .replace(/\/+/gu, "/")
    .replace(/\/$/u, "");

  if (!/^(_documents|_downloads)(\/.+)?$/u.test(normalized)) {
    throw createLocalBackupError(
      "backup_root_invalid",
      "Backup root must stay inside _documents or _downloads.",
    );
  }

  return normalized;
}

function resolveBackupRoot(options?: LocalBackupOptions): string {
  return normalizeLocalBackupRoot(options?.backupRoot);
}

function toAbsoluteBackupPath(backupRoot: string, relativePath: string): string {
  return `${backupRoot}/${relativePath}`.replace(/\/+/gu, "/");
}

export function normalizeRestorableLocalPath(
  filePath: string,
  convertAbsoluteFileSystem?: (path: string) => string | null | undefined,
): string {
  const trimmed = filePath.trim();

  if (!trimmed) {
    return trimmed;
  }

  if (/^(_doc\/|_documents\/|_downloads\/|file:\/\/)/iu.test(trimmed)) {
    return trimmed;
  }

  if (/^(\/storage\/|\/var\/mobile\/)/iu.test(trimmed)) {
    const converted = convertAbsoluteFileSystem?.(trimmed)?.trim();
    if (converted) {
      return converted;
    }

    return `file://${trimmed}`;
  }

  return trimmed;
}

export function getParentDirectoryPath(filePath: string): string {
  const normalized = filePath.replace(/\/+$/u, "");

  if (normalized.startsWith("file://")) {
    const localPath = normalized.slice("file://".length);
    const lastSlashIndex = localPath.lastIndexOf("/");

    if (lastSlashIndex <= 0) {
      return "file:///";
    }

    return `file://${localPath.slice(0, lastSlashIndex)}`;
  }

  const lastSlashIndex = normalized.lastIndexOf("/");
  if (lastSlashIndex <= 0) {
    return normalized;
  }

  return normalized.slice(0, lastSlashIndex);
}

async function waitForPlusReady(): Promise<void> {
  if (typeof plus !== "undefined" && plus.io) {
    return;
  }

  if (typeof document === "undefined" || typeof document.addEventListener !== "function") {
    throw createLocalBackupError("runtime_unavailable", "plus runtime is unavailable.");
  }

  await new Promise<void>((resolve) => {
    document.addEventListener("plusready", () => resolve(), {
      once: true,
    });
  });
}

function toBackupRelativePath(originalUri: string): string {
  const normalized = originalUri.replace(/^file:\/\//iu, "");
  const cleaned = normalized.replace(/^\/+/u, "");
  return `files/${cleaned.split("/").map(sanitizeBackupSegment).join("/")}`;
}

export function isMissingManagedAssetError(error: unknown): boolean {
  const message = error instanceof Error
    ? error.message
    : typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: unknown }).message ?? "")
      : "";

  return /not exists|no such file|not found|不存在|找不到|无法找到/iu.test(message);
}

export async function buildBackupAssetExportPlan(
  originalUris: string[],
  canAccess: (path: string) => Promise<boolean>,
): Promise<BackupAssetExportPlan> {
  const assets: BackupManifestAsset[] = [];
  const skippedOriginalUris: string[] = [];

  for (const originalUri of originalUris) {
    if (await canAccess(originalUri)) {
      assets.push({
        originalUri,
        backupRelativePath: toBackupRelativePath(originalUri),
      });
      continue;
    }

    skippedOriginalUris.push(originalUri);
  }

  return {
    assets,
    skippedOriginalUris,
  };
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
  await waitForPlusReady();
  return new Promise((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(url, resolve, reject);
  });
}

async function canResolveManagedAsset(url: string): Promise<boolean> {
  try {
    await resolveEntry(url);
    return true;
  } catch (error) {
    if (isMissingManagedAssetError(error)) {
      return false;
    }

    throw error;
  }
}

async function ensureDirectory(relativePath: string): Promise<any> {
  const normalizedPath = normalizeRestorableLocalPath(
    relativePath,
    typeof plus !== "undefined" && plus.io?.convertAbsoluteFileSystem
      ? (path) => plus.io.convertAbsoluteFileSystem(path)
      : undefined,
  );

  try {
    return await resolveEntry(normalizedPath);
  } catch (error) {
    const parentPath = getParentDirectoryPath(normalizedPath);
    if (!parentPath || parentPath === normalizedPath) {
      throw error;
    }

    const parentEntry = await ensureDirectory(parentPath);
    const directoryName = normalizedPath
      .slice(parentPath.length)
      .replace(/^\/+/u, "");

    return new Promise((resolve, reject) => {
      parentEntry.getDirectory(directoryName, { create: true }, resolve, reject);
    });
  }
}

async function ensureParentDirectory(filePath: string): Promise<any> {
  const parentPath = getParentDirectoryPath(filePath);
  return ensureDirectory(parentPath);
}

async function assertBackupRootWritable(backupRoot: string): Promise<void> {
  const probeRelativePath = `.probe-${Date.now()}.txt`;
  const absoluteProbePath = toAbsoluteBackupPath(backupRoot, probeRelativePath);

  try {
    await ensureDirectory(backupRoot);
    await writeTextFile(backupRoot, probeRelativePath, "ok");
    await removeEntryIfExists(absoluteProbePath);
  } catch (error) {
    throw createLocalBackupError(
      "backup_root_unwritable",
      "Backup root is not writable.",
      error,
    );
  }
}

async function assertBackupDatabaseReadable(): Promise<void> {
  try {
    await resolveEntry(SQLITE_DB_PATH);
  } catch (error) {
    throw createLocalBackupError(
      "backup_database_unavailable",
      "SQLite backup source is unavailable.",
      error,
    );
  }
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

async function writeTextFile(backupRoot: string, relativePath: string, content: string): Promise<void> {
  const targetPath = toAbsoluteBackupPath(backupRoot, relativePath);
  const parent = await ensureParentDirectory(targetPath);
  const fileName = targetPath.split("/").pop() ?? "file.txt";
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
  });
}

async function copyFile(sourceUri: string, backupRoot: string, targetRelativePath: string): Promise<void> {
  const sourceEntry = await resolveEntry(sourceUri);
  const absoluteTargetPath = toAbsoluteBackupPath(backupRoot, targetRelativePath);
  const parentDir = await ensureParentDirectory(absoluteTargetPath);
  const targetName = targetRelativePath.split("/").pop() ?? "file";

  await removeEntryIfExists(absoluteTargetPath);

  await new Promise<void>((resolve, reject) => {
    sourceEntry.copyTo(parentDir, targetName, () => resolve(), reject);
  });
}

async function copyBackupFileToOriginal(backupRoot: string, sourceRelativePath: string, originalUri: string): Promise<void> {
  const sourceEntry = await resolveEntry(toAbsoluteBackupPath(backupRoot, sourceRelativePath));
  const parentDir = await ensureParentDirectory(originalUri);
  const fileName = originalUri.split("/").pop() ?? "file";

  await removeEntryIfExists(originalUri);

  await new Promise<void>((resolve, reject) => {
    sourceEntry.copyTo(parentDir, fileName, () => resolve(), reject);
  });
}

async function readTextFile(backupRoot: string, relativePath: string): Promise<string> {
  const entry = await resolveEntry(toAbsoluteBackupPath(backupRoot, relativePath));
  const file = await new Promise<any>((resolve, reject) => entry.file(resolve, reject));
  const reader = new FileReader();

  return new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function readBackupManifest(backupRoot: string, backupId: string): Promise<BackupManifest> {
  const raw = await readTextFile(backupRoot, `${backupId}/${MANIFEST_NAME}`);
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

export async function listLocalBackups(options: LocalBackupOptions = {}): Promise<LocalBackupSummary[]> {
  if (!isAppPlusRuntime()) {
    return [];
  }

  try {
    const backupRoot = resolveBackupRoot(options);
    const rootEntry = await ensureDirectory(backupRoot);
    const entries = await new Promise<any[]>((resolve, reject) => {
      rootEntry.createReader().readEntries(resolve, reject);
    });

    const summaries = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory)
        .map(async (entry) => {
          const manifest = await readBackupManifest(backupRoot, entry.name);
          return {
            backupId: manifest.backupId,
            createdAt: manifest.createdAt,
            absolutePath: `${backupRoot}/${entry.name}`,
            backupRoot,
          };
        }),
    );

    return summaries.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  } catch {
    return [];
  }
}

export async function exportLocalBackup(options: LocalBackupOptions = {}): Promise<LocalBackupSummary> {
  if (!isAppPlusRuntime()) {
    throw createLocalBackupError(
      "runtime_unavailable",
      "Local backup is only available in app-plus runtime.",
    );
  }

  const backupRoot = resolveBackupRoot(options);
  await assertBackupRootWritable(backupRoot);
  await assertBackupDatabaseReadable();
  const createdAt = nowIso();
  const backupId = createdAt.replace(/[:.]/gu, "-");
  const backupDir = `${backupRoot}/${backupId}`;
  const entries = await getEntryRepository().getAllActive();
  const drafts = await getDraftRepository().getAll();
  const managedAssets = collectManagedBackupAssets(entries, drafts);
  const assetPlan = await buildBackupAssetExportPlan(managedAssets, canResolveManagedAsset);
  const storageMap = getStorageMap();
  const manifest: BackupManifest = {
    version: 1,
    createdAt,
    backupId,
    dbRelativePath: SQLITE_BACKUP_FILE,
    prefsRelativePath: PREFS_BACKUP_FILE,
    draftShadowRelativePath: DRAFT_SHADOW_BACKUP_FILE,
    assets: assetPlan.assets,
  };

  await ensureDirectory(backupDir);
  closeSQLiteIfOpen();
  try {
    await copyFile(SQLITE_DB_PATH, backupRoot, `${backupId}/${SQLITE_BACKUP_FILE}`);
  } catch (error) {
    throw createLocalBackupError("backup_write_failed", "Failed to export SQLite backup.", error);
  }
  await writeTextFile(backupRoot, `${backupId}/${PREFS_BACKUP_FILE}`, storageMap.preferences);
  await writeTextFile(backupRoot, `${backupId}/${DRAFT_SHADOW_BACKUP_FILE}`, storageMap.draftShadow);

  let skippedAssetCount = assetPlan.skippedOriginalUris.length;

  for (const asset of manifest.assets) {
    try {
      await copyFile(asset.originalUri, backupRoot, `${backupId}/${asset.backupRelativePath}`);
    } catch (error) {
      if (isMissingManagedAssetError(error)) {
        skippedAssetCount += 1;
        continue;
      }

      throw createLocalBackupError("backup_write_failed", "Failed to export managed asset.", error);
    }
  }

  await writeTextFile(backupRoot, `${backupId}/${MANIFEST_NAME}`, JSON.stringify(manifest, null, 2));

  return {
    backupId,
    createdAt,
    absolutePath: backupDir,
    backupRoot,
    skippedAssetCount,
  };
}

export async function importLocalBackup(backupId: string, options: LocalBackupOptions = {}): Promise<void> {
  if (!isAppPlusRuntime()) {
    throw createLocalBackupError(
      "runtime_unavailable",
      "Local restore is only available in app-plus runtime.",
    );
  }

  const backupRoot = resolveBackupRoot(options);
  let manifest: BackupManifest;

  try {
    manifest = await readBackupManifest(backupRoot, backupId);
  } catch (error) {
    throw createLocalBackupError("backup_manifest_invalid", "Backup manifest is unavailable or invalid.", error);
  }
  const storage = createUniJsonStorage();

  closeSQLiteIfOpen();
  try {
    await copyBackupFileToOriginal(backupRoot, `${backupId}/${manifest.dbRelativePath}`, SQLITE_DB_PATH);
  } catch (error) {
    throw createLocalBackupError("backup_restore_failed", "Failed to restore SQLite backup.", error);
  }

  for (const asset of manifest.assets) {
    try {
      await copyBackupFileToOriginal(backupRoot, `${backupId}/${asset.backupRelativePath}`, asset.originalUri);
    } catch (error) {
      if (isMissingManagedAssetError(error)) {
        continue;
      }

      throw createLocalBackupError("backup_restore_failed", "Failed to restore managed asset.", error);
    }
  }

  storage.setString("noche.preferences.v1", await readTextFile(backupRoot, `${backupId}/${manifest.prefsRelativePath}`));
  storage.setString("noche.editor-draft-shadow.v1", await readTextFile(backupRoot, `${backupId}/${manifest.draftShadowRelativePath}`));
}

export function restartAppAfterRestore(): void {
  if (typeof plus !== "undefined" && plus.runtime?.restart) {
    plus.runtime.restart();
  }
}
