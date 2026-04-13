import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { APP_VERSION, resolveAppManifest, resolveAppVersion } from "@/shared/appMeta";

describe("appMeta", () => {
  it("accepts either a raw json string or an already-materialized manifest object", () => {
    expect(resolveAppManifest('{"versionName":"1.2.3"}')).toEqual({ versionName: "1.2.3" });
    expect(resolveAppManifest({ versionName: "2.0.0" })).toEqual({ versionName: "2.0.0" });
    expect(resolveAppVersion('{"versionName":"3.1.4"}')).toBe("3.1.4");
    expect(resolveAppVersion({ versionName: "4.0.0" })).toBe("4.0.0");
  });

  it("reads the shipped app version from manifest.json instead of hardcoding it in profile data", () => {
    const manifest = JSON.parse(readFileSync(resolve(process.cwd(), "src/manifest.json"), "utf8")) as {
      versionName?: string;
    };

    expect(APP_VERSION).toBe(manifest.versionName);
  });
});
