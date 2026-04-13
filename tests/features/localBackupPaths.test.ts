import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCAL_BACKUP_ROOT,
  getParentDirectoryPath,
  normalizeLocalBackupRoot,
  normalizeRestorableLocalPath,
} from "@/features/profile/localBackup";

describe("local backup paths", () => {
  it("uses the shared default backup folder when the user keeps the default flow", () => {
    expect(normalizeLocalBackupRoot()).toBe(DEFAULT_LOCAL_BACKUP_ROOT);
    expect(normalizeLocalBackupRoot("")).toBe(DEFAULT_LOCAL_BACKUP_ROOT);
  });

  it("normalizes a manually selected shared backup folder", () => {
    expect(normalizeLocalBackupRoot("  _downloads/noche-backups/custom/  ")).toBe("_downloads/noche-backups/custom");
    expect(normalizeLocalBackupRoot("_documents/my-backups")).toBe("_documents/my-backups");
  });

  it("rejects unsupported backup roots outside the shared folders", () => {
    expect(() => normalizeLocalBackupRoot("_doc/private-only")).toThrow("Backup root must stay inside _documents or _downloads.");
    expect(() => normalizeLocalBackupRoot("backup-folder")).toThrow("Backup root must stay inside _documents or _downloads.");
  });

  it("normalizes restore targets across sandbox, file URLs, and absolute device paths", () => {
    expect(normalizeRestorableLocalPath("_doc/media/image.png")).toBe("_doc/media/image.png");
    expect(normalizeRestorableLocalPath("file:///storage/emulated/0/DCIM/cat.png")).toBe("file:///storage/emulated/0/DCIM/cat.png");
    expect(normalizeRestorableLocalPath("/storage/emulated/0/DCIM/cat.png", (path) => `file://${path}`)).toBe("file:///storage/emulated/0/DCIM/cat.png");
    expect(normalizeRestorableLocalPath("/var/mobile/Containers/Data/cat.png", () => null)).toBe("file:///var/mobile/Containers/Data/cat.png");
  });

  it("derives parent directories without breaking file URL prefixes", () => {
    expect(getParentDirectoryPath("_documents/noche-backups/2026/manifest.json")).toBe("_documents/noche-backups/2026");
    expect(getParentDirectoryPath("file:///storage/emulated/0/DCIM/cat.png")).toBe("file:///storage/emulated/0/DCIM");
    expect(getParentDirectoryPath("/storage/emulated/0/DCIM/cat.png")).toBe("/storage/emulated/0/DCIM");
  });
});
