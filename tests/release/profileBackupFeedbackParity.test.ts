import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile backup feedback parity", () => {
  it("keeps immediate in-page backup feedback and progress copy on the profile page", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(profilePage).toContain("backupNoticeCopy");
    expect(profilePage).toContain("backupNoticeTone = ref<\"success\" | \"error\" | \"info\" | null>");
    expect(profilePage).toContain("backupProgressPercent");
    expect(profilePage).toContain("profile-page__progress-fill");
    expect(profilePage).toContain("resolveBackupProgressStepText");
    expect(profilePage).toContain("copy.value.profile.exportInProgress");
    expect(profilePage).toContain("copy.value.profile.restoreLoadingTitle");
    expect(profilePage).toContain("copy.value.profile.restoreInProgress");
    expect(i18n).toContain('exportInProgress: "正在导出备份"');
    expect(i18n).toContain('restoreLoadingTitle: "正在读取备份"');
    expect(i18n).toContain('backupStepCopyDatabase: "复制数据库文件"');
  });
});
