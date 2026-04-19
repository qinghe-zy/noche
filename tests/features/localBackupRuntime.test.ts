import { afterEach, describe, expect, it, vi } from "vitest";
import { exportLocalBackup, importLocalBackup } from "@/features/profile/localBackup";
import { SQLITE_DB_PATH } from "@/data/db/schema";
import { setDraftRepository } from "@/app/store/useDraftStore";
import { setEntryRepository } from "@/app/store/entryRepository";
import type { IDraftRepository } from "@/data/repositories/draft.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";

type FsNode =
  | { type: "dir" }
  | { type: "file"; content: string };

function normalizeFsPath(path: string): string {
  return path.replace(/\\/gu, "/").replace(/\/+/gu, "/").replace(/\/$/u, "");
}

function getBaseName(path: string): string {
  const normalized = normalizeFsPath(path);
  const segments = normalized.split("/");
  return segments[segments.length - 1] ?? normalized;
}

function getParentPath(path: string): string {
  const normalized = normalizeFsPath(path);
  const lastSlashIndex = normalized.lastIndexOf("/");
  return lastSlashIndex <= 0 ? normalized : normalized.slice(0, lastSlashIndex);
}

function createFakeFs(
  sqliteState: { isOpen: boolean },
  options: {
    stallCopyFromPaths?: string[];
  } = {},
) {
  const nodes = new Map<string, FsNode>([
    ["_doc", { type: "dir" }],
    ["_documents", { type: "dir" }],
    [SQLITE_DB_PATH, { type: "file", content: "sqlite-binary" }],
  ]);

  function ensureDir(path: string): void {
    const normalized = normalizeFsPath(path);
    if (nodes.has(normalized)) {
      return;
    }

    const parentPath = getParentPath(normalized);
    if (parentPath !== normalized) {
      ensureDir(parentPath);
    }

    nodes.set(normalized, { type: "dir" });
  }

  function writeFile(path: string, content: string): void {
    ensureDir(getParentPath(path));
    nodes.set(normalizeFsPath(path), { type: "file", content });
  }

  function entryFor(path: string): any {
    const normalized = normalizeFsPath(path);
    const node = nodes.get(normalized);
    if (!node) {
      throw new Error(`Missing entry: ${normalized}`);
    }

    return {
      isDirectory: node.type === "dir",
      isFile: node.type === "file",
      name: getBaseName(normalized),
      fullPath: normalized,
      file(success: (file: Blob) => void, fail: (error: Error) => void) {
        const current = nodes.get(normalized);
        if (!current || current.type !== "file") {
          fail(new Error(`File not exists: ${normalized}`));
          return;
        }

        success(new Blob([current.content], { type: "application/json" }));
      },
      getDirectory(name: string, options: { create?: boolean }, success: (entry: any) => void, fail: (error: Error) => void) {
        const childPath = normalizeFsPath(`${normalized}/${name}`);
        const child = nodes.get(childPath);

        if (child?.type === "dir") {
          success(entryFor(childPath));
          return;
        }

        if (options.create) {
          ensureDir(childPath);
          success(entryFor(childPath));
          return;
        }

        fail(new Error(`Directory not exists: ${childPath}`));
      },
      getFile(name: string, options: { create?: boolean }, success: (entry: any) => void, fail: (error: Error) => void) {
        const childPath = normalizeFsPath(`${normalized}/${name}`);
        const child = nodes.get(childPath);

        if (child?.type === "file") {
          success(entryFor(childPath));
          return;
        }

        if (options.create) {
          writeFile(childPath, "");
          success(entryFor(childPath));
          return;
        }

        fail(new Error(`File not exists: ${childPath}`));
      },
      createReader() {
        return {
          readEntries(success: (entries: any[]) => void) {
            const children = Array.from(nodes.keys())
              .filter((candidate) => getParentPath(candidate) === normalized && candidate !== normalized)
              .map((candidate) => entryFor(candidate));
            success(children);
          },
        };
      },
      createWriter(success: (writer: any) => void) {
        const writer = {
          onwrite: null as null | (() => void),
          onerror: null as null | ((error: Error) => void),
          write(content: string) {
            writeFile(normalized, content);
            this.onwrite?.();
          },
        };

        success(writer);
      },
      copyTo(parentDir: { fullPath: string }, targetName: string, success: () => void, fail: (error: Error) => void) {
        if (options.stallCopyFromPaths?.includes(normalized)) {
          return;
        }

        if (normalized === SQLITE_DB_PATH && sqliteState.isOpen) {
          fail(new Error("database busy"));
          return;
        }

        const source = nodes.get(normalized);
        if (!source || source.type !== "file") {
          fail(new Error(`File not exists: ${normalized}`));
          return;
        }

        writeFile(`${parentDir.fullPath}/${targetName}`, source.content);
        success();
      },
      remove(success: () => void) {
        nodes.delete(normalized);
        success();
      },
      removeRecursively(success: () => void) {
        for (const key of Array.from(nodes.keys())) {
          if (key === normalized || key.startsWith(`${normalized}/`)) {
            nodes.delete(key);
          }
        }

        success();
      },
    };
  }

  return {
    nodes,
    resolveLocalFileSystemURL(url: string, success: (entry: any) => void, fail: (error: Error) => void) {
      const normalized = normalizeFsPath(url);
      const node = nodes.get(normalized);
      if (!node) {
        fail(new Error(`not exists: ${normalized}`));
        return;
      }

      success(entryFor(normalized));
    },
    requestFileSystem(type: number, success: (fs: { root: any }) => void, fail: (error: Error) => void) {
      if (type === 3) {
        ensureDir("_documents");
        success({ root: entryFor("_documents") });
        return;
      }

      if (type === 4) {
        ensureDir("_downloads");
        success({ root: entryFor("_downloads") });
        return;
      }

      fail(new Error(`Unsupported fs type: ${type}`));
    },
  };
}

const emptyDraftRepository: IDraftRepository = {
  async save() {},
  async getBySlotKey() {
    return null;
  },
  async getAll() {
    return [];
  },
  async deleteBySlotKey() {},
};

const emptyEntryRepository: IEntryRepository = {
  async save() {},
  async getById() {
    return null;
  },
  async getByDate() {
    return [];
  },
  async getAllActive() {
    return [];
  },
  async getByType() {
    return [];
  },
  async deleteById() {},
  async getCalendarMarkedDates() {
    return [];
  },
  async getProfileStats() {
    return {
      recordedDays: 0,
      totalWords: 0,
      diaryCount: 0,
    };
  },
  async getCalendarPreviewEntries() {
    return [];
  },
  async getUnlockableFutureEntries() {
    return [];
  },
  async getMailboxCollections() {
    return {
      documentaryDiaries: [],
      documentaryJottings: [],
      distantOpenedFutures: [],
      distantPendingFutures: [],
    };
  },
  async getProfileAlbumItems() {
    return [];
  },
};

describe("local backup runtime export", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setDraftRepository(emptyDraftRepository);
    setEntryRepository(emptyEntryRepository);
  });

  it("waits for sqlite close to finish before copying the backup database", async () => {
    const sqliteState = { isOpen: true };
    const fakeFs = createFakeFs(sqliteState);
    const closeDatabase = vi.fn(({ success }: { success?: () => void }) => {
      setTimeout(() => {
        sqliteState.isOpen = false;
        success?.();
      }, 0);
    });

    vi.stubGlobal("plus", {
      io: {
        resolveLocalFileSystemURL: fakeFs.resolveLocalFileSystemURL,
        requestFileSystem: fakeFs.requestFileSystem,
        PUBLIC_DOCUMENTS: 3,
        PUBLIC_DOWNLOADS: 4,
      },
      sqlite: {
        isOpenDatabase: vi.fn(() => sqliteState.isOpen),
        closeDatabase,
      },
    });
    vi.stubGlobal("uni", {
      getStorageSync: vi.fn((key: string) => {
        if (key === "noche.preferences.v1") {
          return "{}";
        }

        if (key === "noche.editor-draft-shadow.v1") {
          return "{}";
        }

        return "";
      }),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn(),
    });
    setDraftRepository(emptyDraftRepository);
    setEntryRepository(emptyEntryRepository);

    const result = await exportLocalBackup({
      backupRoot: "_documents/eyot-backups",
    });

    expect(closeDatabase).toHaveBeenCalledTimes(1);
    expect(fakeFs.nodes.has(`${result.backupId}/db/noche.db`)).toBe(false);
    expect(fakeFs.nodes.has(`${result.absolutePath}/db/noche.db`)).toBe(true);
  });

  it("fails instead of hanging forever when a native copy callback never settles", async () => {
    vi.useFakeTimers();

    const sqliteState = { isOpen: false };
    const fakeFs = createFakeFs(sqliteState, {
      stallCopyFromPaths: [SQLITE_DB_PATH],
    });

    vi.stubGlobal("plus", {
      io: {
        resolveLocalFileSystemURL: fakeFs.resolveLocalFileSystemURL,
        requestFileSystem: fakeFs.requestFileSystem,
        PUBLIC_DOCUMENTS: 3,
        PUBLIC_DOWNLOADS: 4,
      },
      sqlite: {
        isOpenDatabase: vi.fn(() => sqliteState.isOpen),
        closeDatabase: vi.fn(),
      },
    });
    vi.stubGlobal("uni", {
      getStorageSync: vi.fn((key: string) => {
        if (key === "noche.preferences.v1") {
          return "{}";
        }

        if (key === "noche.editor-draft-shadow.v1") {
          return "{}";
        }

        return "";
      }),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn(),
    });

    const exportPromise = exportLocalBackup({
      backupRoot: "_documents/eyot-backups",
    });
    const rejectionExpectation = expect(exportPromise).rejects.toMatchObject({
      code: "backup_write_failed",
    });

    await vi.advanceTimersByTimeAsync(15000);

    await rejectionExpectation;

    vi.useRealTimers();
  });

  it("reports monotonic export progress and finishes at 100 percent", async () => {
    const sqliteState = { isOpen: false };
    const fakeFs = createFakeFs(sqliteState);
    const progressRatios: number[] = [];
    const progressLabels: string[] = [];

    vi.stubGlobal("plus", {
      io: {
        resolveLocalFileSystemURL: fakeFs.resolveLocalFileSystemURL,
        requestFileSystem: fakeFs.requestFileSystem,
        PUBLIC_DOCUMENTS: 3,
        PUBLIC_DOWNLOADS: 4,
      },
      sqlite: {
        isOpenDatabase: vi.fn(() => sqliteState.isOpen),
        closeDatabase: vi.fn(),
      },
    });
    vi.stubGlobal("uni", {
      getStorageSync: vi.fn((key: string) => {
        if (key === "noche.preferences.v1") {
          return "{}";
        }

        if (key === "noche.editor-draft-shadow.v1") {
          return "{}";
        }

        return "";
      }),
      setStorageSync: vi.fn(),
      removeStorageSync: vi.fn(),
    });

    await exportLocalBackup({
      backupRoot: "_documents/eyot-backups",
      onProgress: (progress) => {
        progressRatios.push(progress.ratio);
        progressLabels.push(progress.label);
      },
    });

    expect(progressRatios.length).toBeGreaterThan(0);
    expect(progressRatios.at(0)).toBeGreaterThan(0);
    expect(progressRatios.at(-1)).toBe(1);
    expect(progressRatios.every((ratio, index) => index === 0 || ratio >= progressRatios[index - 1])).toBe(true);
    expect(progressLabels.at(-1)).toBe("write-manifest");
  });

  it("reports monotonic restore progress and finishes at 100 percent", async () => {
    const sqliteState = { isOpen: false };
    const fakeFs = createFakeFs(sqliteState);
    const exportProgressLabels: string[] = [];

    vi.stubGlobal("plus", {
      io: {
        resolveLocalFileSystemURL: fakeFs.resolveLocalFileSystemURL,
        requestFileSystem: fakeFs.requestFileSystem,
        PUBLIC_DOCUMENTS: 3,
        PUBLIC_DOWNLOADS: 4,
      },
      sqlite: {
        isOpenDatabase: vi.fn(() => sqliteState.isOpen),
        closeDatabase: vi.fn(),
      },
    });
    vi.stubGlobal("FileReader", class {
      result: string | null = null;
      onload: null | (() => void) = null;
      onerror: null | ((error: Error) => void) = null;

      readAsText(file: Blob) {
        void file.text()
          .then((text) => {
            this.result = text;
            this.onload?.();
          })
          .catch((error) => {
            this.onerror?.(error instanceof Error ? error : new Error(String(error)));
          });
      }
    });

    const storageRecords = new Map<string, string>([
      ["noche.preferences.v1", "{}"],
      ["noche.editor-draft-shadow.v1", "{}"],
    ]);

    vi.stubGlobal("uni", {
      getStorageSync: vi.fn((key: string) => storageRecords.get(key) ?? ""),
      setStorageSync: vi.fn((key: string, value: string) => {
        storageRecords.set(key, value);
      }),
      removeStorageSync: vi.fn((key: string) => {
        storageRecords.delete(key);
      }),
    });

    const exported = await exportLocalBackup({
      backupRoot: "_documents/eyot-backups",
      onProgress: (progress) => {
        exportProgressLabels.push(progress.label);
      },
    });

    expect(exportProgressLabels.at(-1)).toBe("write-manifest");

    const restoreProgressRatios: number[] = [];
    const restoreProgressLabels: string[] = [];

    await importLocalBackup(exported.backupId, {
      backupRoot: exported.backupRoot,
      onProgress: (progress) => {
        restoreProgressRatios.push(progress.ratio);
        restoreProgressLabels.push(progress.label);
      },
    });

    expect(restoreProgressRatios.length).toBeGreaterThan(0);
    expect(restoreProgressRatios.at(0)).toBeGreaterThan(0);
    expect(restoreProgressRatios.at(-1)).toBe(1);
    expect(restoreProgressRatios.every((ratio, index) => index === 0 || ratio >= restoreProgressRatios[index - 1])).toBe(true);
    expect(restoreProgressLabels.at(-1)).toBe("restore-storage");
  });
});
