import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configurePersistenceAdapters } from "@/app/providers/configurePersistenceAdapters";
import { createMemoryDraftRepository } from "@/data/repositories/memoryDraftRepository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import { createMemoryPrefsRepository } from "@/data/repositories/memoryPrefsRepository";
import { exportLocalBackup, listLocalBackups } from "@/features/profile/localBackup";

type MockNode = MockDirectory | MockFile;

class MockFile {
  constructor(
    public name: string,
    public fullPath: string,
    public content = "",
  ) {}

  get isDirectory() {
    return false;
  }

  createWriter(success: (writer: { onwrite: (() => void) | null; onerror: ((error: unknown) => void) | null; write: (content: string) => void }) => void) {
    const file = this;
    success({
      onwrite: null,
      onerror: null,
      write(content: string) {
        file.content = content;
        this.onwrite?.();
      },
    });
  }

  copyTo(parent: MockDirectory, targetName: string, success: () => void) {
    parent.children.set(targetName, new MockFile(targetName, `${parent.fullPath}/${targetName}`.replace(/\/+/g, "/"), this.content));
    success();
  }

  remove(success: () => void) {
    success();
  }

  file(success: (file: { content: string }) => void) {
    success({ content: this.content });
  }
}

class MockDirectory {
  public children = new Map<string, MockNode>();

  constructor(
    public name: string,
    public fullPath: string,
  ) {}

  get isDirectory() {
    return true;
  }

  getDirectory(name: string, options: { create?: boolean }, success: (dir: MockDirectory) => void, fail: (error: unknown) => void) {
    const existing = this.children.get(name);
    if (existing instanceof MockDirectory) {
      success(existing);
      return;
    }

    if (!existing && options.create) {
      const directory = new MockDirectory(name, `${this.fullPath}/${name}`.replace(/\/+/g, "/"));
      this.children.set(name, directory);
      success(directory);
      return;
    }

    fail(new Error(`Directory not found: ${name}`));
  }

  getFile(name: string, options: { create?: boolean }, success: (file: MockFile) => void, fail: (error: unknown) => void) {
    const existing = this.children.get(name);
    if (existing instanceof MockFile) {
      success(existing);
      return;
    }

    if (!existing && options.create) {
      const file = new MockFile(name, `${this.fullPath}/${name}`.replace(/\/+/g, "/"));
      this.children.set(name, file);
      success(file);
      return;
    }

    fail(new Error(`File not found: ${name}`));
  }

  createReader() {
    const directory = this;
    return {
      readEntries(success: (entries: MockNode[]) => void) {
        success(Array.from(directory.children.values()));
      },
    };
  }

  copyTo(parent: MockDirectory, targetName: string, success: () => void) {
    const clone = new MockDirectory(targetName, `${parent.fullPath}/${targetName}`.replace(/\/+/g, "/"));
    parent.children.set(targetName, clone);
    success();
  }

  removeRecursively(success: () => void) {
    this.children.clear();
    success();
  }
}

function findNode(root: MockDirectory, path: string): MockNode | null {
  const segments = path.replace(/^\/+/, "").split("/").filter(Boolean);
  let current: MockNode = root;

  for (const segment of segments) {
    if (!(current instanceof MockDirectory)) {
      return null;
    }
    current = current.children.get(segment) ?? null;
    if (!current) {
      return null;
    }
  }

  return current;
}

describe("local backup", () => {
  const storage = new Map<string, string>();
  const docRoot = new MockDirectory("_doc", "_doc");
  const documentsRoot = new MockDirectory("_documents", "_documents");
  let sqliteOpen = true;
  let openDatabaseCalls = 0;

  beforeEach(() => {
    setActivePinia(createPinia());
    configurePersistenceAdapters({
      draftRepository: createMemoryDraftRepository(),
      entryRepository: createMemoryEntryRepository(),
      prefsRepository: createMemoryPrefsRepository(),
    });
    storage.clear();
    docRoot.children.clear();
    documentsRoot.children.clear();
    docRoot.children.set("noche.db", new MockFile("noche.db", "_doc/noche.db", "sqlite-db"));
    sqliteOpen = true;
    openDatabaseCalls = 0;

    vi.stubGlobal("uni", {
      getStorageSync: (key: string) => storage.get(key) ?? "",
      setStorageSync: (key: string, value: string) => storage.set(key, value),
      removeStorageSync: (key: string) => storage.delete(key),
    });

    vi.stubGlobal("plus", {
      io: {
        resolveLocalFileSystemURL(url: string, success: (entry: MockNode) => void, fail: (error: unknown) => void) {
          const root = url.startsWith("_documents") ? documentsRoot : docRoot;
          const normalized = url.replace(/^_documents\/?/, "").replace(/^_doc\/?/, "");
          const target = normalized ? findNode(root, normalized) : root;
          if (!target) {
            fail(new Error(`Not found: ${url}`));
            return;
          }
          success(target);
        },
        convertLocalFileSystemURL: (path: string) => `/storage/emulated/0/Android/data/com.qinghezy.jiyu/${path.replace(/^_documents\//, "").replace(/^_doc\//, "")}`,
      },
      sqlite: {
        isOpenDatabase: () => sqliteOpen,
        closeDatabase: ({ success }: { success?: () => void }) => {
          sqliteOpen = false;
          success?.();
        },
        openDatabase: ({ success }: { success?: () => void }) => {
          openDatabaseCalls += 1;
          sqliteOpen = true;
          success?.();
        },
      },
    });

    vi.stubGlobal("FileReader", class {
      result: string | null = null;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;

      readAsText(file: { content: string }) {
        this.result = file.content;
        this.onload?.();
      }
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exports backups into the backup root and returns a display path", async () => {
    const result = await exportLocalBackup();

    expect(result.backupId).toBeTruthy();
    expect(result.absolutePath).toContain("/storage/emulated/0/Android/data/com.qinghezy.jiyu/noche-backups/");
    const backupFolder = findNode(documentsRoot, `noche-backups/${result.backupId}`);
    expect(backupFolder).toBeTruthy();
    expect(sqliteOpen).toBe(true);
    expect(openDatabaseCalls).toBe(1);
  });

  it("lists valid backups even if one backup directory is broken", async () => {
    const result = await exportLocalBackup();
    const backupsRoot = findNode(documentsRoot, "noche-backups") as MockDirectory;
    backupsRoot.children.set("broken-backup", new MockDirectory("broken-backup", "_documents/noche-backups/broken-backup"));

    const backups = await listLocalBackups();

    expect(backups.map((item) => item.backupId)).toContain(result.backupId);
    expect(backups.some((item) => item.backupId === "broken-backup")).toBe(false);
  });
});
