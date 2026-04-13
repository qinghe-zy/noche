import { describe, expect, it } from "vitest";
import {
  buildBackupAssetExportPlan,
  isMissingManagedAssetError,
} from "@/features/profile/localBackup";

describe("local backup export planning", () => {
  it("skips missing managed assets instead of failing the whole backup plan", async () => {
    const plan = await buildBackupAssetExportPlan(
      [
        "_doc/kept.png",
        "file:///storage/emulated/0/DCIM/missing.png",
        "_documents/also-kept.png",
      ],
      async (path) => !path.includes("missing"),
    );

    expect(plan.assets.map((asset) => asset.originalUri)).toEqual([
      "_doc/kept.png",
      "_documents/also-kept.png",
    ]);
    expect(plan.skippedOriginalUris).toEqual([
      "file:///storage/emulated/0/DCIM/missing.png",
    ]);
  });

  it("treats common not-found variants as skippable local asset failures", () => {
    expect(isMissingManagedAssetError(new Error("No such file or directory"))).toBe(true);
    expect(isMissingManagedAssetError({ message: "文件不存在" })).toBe(true);
    expect(isMissingManagedAssetError(new Error("Permission denied"))).toBe(false);
  });
});
