import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(projectRoot, relativePath), "utf8"));
}

function safeRead(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return null;
  }

  return readFileSync(absolutePath, "utf8");
}

function collectDCloudVersions(packageJson) {
  const versionMap = new Map();
  const buckets = [packageJson.dependencies ?? {}, packageJson.devDependencies ?? {}];
  const ignoredPackages = new Set([
    "@dcloudio/types",
  ]);

  for (const bucket of buckets) {
    for (const [name, version] of Object.entries(bucket)) {
      if (!name.startsWith("@dcloudio/") || ignoredPackages.has(name)) {
        continue;
      }

      if (!versionMap.has(version)) {
        versionMap.set(version, []);
      }

      versionMap.get(version).push(name);
    }
  }

  return [...versionMap.entries()].sort(([left], [right]) => left.localeCompare(right));
}

function readCompilerVersion(relativePath) {
  const appConfig = safeRead(relativePath);
  if (!appConfig) {
    return null;
  }

  const matched = appConfig.match(/"compilerVersion":"([^"]+)"/u);
  return matched?.[1] ?? null;
}

function readLaunchConfig() {
  const rawLaunchConfig = safeRead(".hbuilderx/launch.json");
  if (!rawLaunchConfig) {
    return null;
  }

  const launchConfig = JSON.parse(rawLaunchConfig);
  return launchConfig.configurations?.[0] ?? null;
}

const packageJson = readJson("package.json");
const manifest = readJson("src/manifest.json");
const dcloudVersions = collectDCloudVersions(packageJson);
const devCompilerVersion = readCompilerVersion("dist/dev/app-plus/app-config-service.js");
const buildCompilerVersion = readCompilerVersion("dist/build/app/app-config-service.js");
const launchConfig = readLaunchConfig();

console.log("=== uni-app Runtime Doctor ===");
console.log(`AppID: ${manifest.appid || "(missing)"}`);
console.log(`Android package: ${manifest["app-plus"]?.distribute?.android?.packagename || "(missing)"}`);

console.log("\nDCloud compiler dependency lines:");
for (const [version, packages] of dcloudVersions) {
  console.log(`- ${version}`);
  console.log(`  ${packages.join(", ")}`);
}

console.log(`\nApp-plus compilerVersion snapshots:`);
console.log(`- dist/dev/app-plus: ${devCompilerVersion ?? "(not built yet)"}`);
console.log(`- dist/build/app: ${buildCompilerVersion ?? "(not built yet)"}`);

if (launchConfig) {
  console.log("\nCurrent HBuilderX launch profile:");
  console.log(`- type: ${launchConfig.type ?? "(unknown)"}`);
  console.log(`- playground/base: ${launchConfig.playground ?? "(unknown)"}`);
}

if (dcloudVersions.length > 1) {
  console.log("\nWARNING: Multiple @dcloudio version lines detected. Align them before real-device debugging.");
} else {
  console.log("\nOK: package.json currently pins a single @dcloudio version line.");
}

console.log("\nRecommended verification:");
console.log("1. Keep package.json @dcloudio versions and the phone base on the same release line.");
console.log("2. Clear stale dist/dev/app-plus output before rerunning HBuilderX real-device debugging.");
console.log("3. Rebuild app-plus and confirm dev/build compilerVersion are on the same release line.");
console.log("4. Uninstall the old phone base/custom base before rerunning on Android.");
