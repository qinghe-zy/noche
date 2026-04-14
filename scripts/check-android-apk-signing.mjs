import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";

const projectRoot = process.cwd();
const apkDir = resolve(projectRoot, "dist/release/apk");
const expectedLocalOwnerFragment = "CN=Qinghe ZY";
const expectedLocalSha1 = "86:E1:A8:C3:97:6C:C7:0D:E4:F5:58:55:67:F7:94:05:48:23:E5:98";

function readJarCertificate(apkPath) {
  const output = execFileSync(
    "keytool",
    ["-printcert", "-jarfile", apkPath],
    {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const owner = output.match(/所有者:\s*(.+)/u)?.[1]?.trim()
    ?? output.match(/Owner:\s*(.+)/u)?.[1]?.trim()
    ?? "";
  const sha1 = output.match(/SHA1:\s*([A-F0-9:]+)/u)?.[1]?.trim() ?? "";

  return { owner, sha1 };
}

function classifySignature({ owner, sha1 }) {
  if (owner.includes("CN=Android Debug")) {
    return "debug";
  }

  if (owner.includes(expectedLocalOwnerFragment) || sha1 === expectedLocalSha1) {
    return "local";
  }

  return "unknown";
}

function isHumanReleaseName(fileName) {
  return fileName.startsWith("寄屿-") && fileName.endsWith(".apk");
}

if (!existsSync(apkDir)) {
  console.error(`APK output directory not found: ${apkDir}`);
  process.exit(1);
}

const apkFiles = readdirSync(apkDir)
  .filter((fileName) => fileName.toLowerCase().endsWith(".apk"))
  .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

if (apkFiles.length === 0) {
  console.error(`No APK files found under ${apkDir}`);
  process.exit(1);
}

const reports = apkFiles.map((fileName) => {
  const fullPath = resolve(apkDir, fileName);
  const certificate = readJarCertificate(fullPath);
  const signatureType = classifySignature(certificate);

  return {
    fileName,
    fullPath,
    ...certificate,
    signatureType,
  };
});

console.log("APK signing report:");
for (const report of reports) {
  console.log(`- ${report.fileName}`);
  console.log(`  type: ${report.signatureType}`);
  console.log(`  owner: ${report.owner || "(unknown)"}`);
  console.log(`  sha1: ${report.sha1 || "(unknown)"}`);
}

const humanReleaseReports = reports.filter((report) => isHumanReleaseName(report.fileName));
const debugHumanReleases = humanReleaseReports.filter((report) => report.signatureType === "debug");
const localHumanReleases = humanReleaseReports.filter((report) => report.signatureType === "local");

if (localHumanReleases.length > 0) {
  const newestLocalRelease = [...localHumanReleases]
    .sort((left, right) => right.fileName.localeCompare(left.fileName, "zh-Hans-CN"))[0];
  console.log(`\nRecommended install candidate: ${newestLocalRelease.fullPath}`);
}

if (debugHumanReleases.length > 0) {
  console.error("\nDebug-signed APKs are present in the release folder:");
  for (const report of debugHumanReleases) {
    console.error(`- ${report.fullPath}`);
  }
  process.exit(2);
}

console.log("\nAll human-readable release APK names are using the expected non-debug signature.");
