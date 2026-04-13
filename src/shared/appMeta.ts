import manifestRaw from "@/manifest.json?raw";

interface AppManifestLike {
  versionName?: string;
}

export function resolveAppManifest(value: unknown): AppManifestLike {
  if (typeof value === "string") {
    return JSON.parse(value) as AppManifestLike;
  }

  if (value && typeof value === "object") {
    return value as AppManifestLike;
  }

  return {};
}

export function resolveAppVersion(value: unknown): string {
  const manifest = resolveAppManifest(value);
  return manifest.versionName?.trim() || "0.0.0";
}

export const APP_VERSION = resolveAppVersion(manifestRaw);
