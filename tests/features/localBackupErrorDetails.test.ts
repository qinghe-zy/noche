import { describe, expect, it } from "vitest";
import {
  getLocalBackupErrorCode,
  getLocalBackupErrorDetail,
} from "@/features/profile/localBackup";

describe("local backup error details", () => {
  it("keeps the top-level local backup error code", () => {
    const error = Object.assign(new Error("Failed to export SQLite backup."), {
      code: "backup_write_failed" as const,
      cause: new Error("database busy"),
    });

    expect(getLocalBackupErrorCode(error)).toBe("backup_write_failed");
  });

  it("returns the deepest readable cause message for diagnostics", () => {
    const error = Object.assign(new Error("Failed to export SQLite backup."), {
      code: "backup_write_failed" as const,
      cause: {
        message: "copyTo failed",
        cause: new Error("database busy"),
      },
    });

    expect(getLocalBackupErrorDetail(error)).toBe("database busy");
  });
});
