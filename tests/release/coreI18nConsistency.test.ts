import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("core i18n consistency", () => {
  it("moves diary prelude picker copy behind shared i18n keys", () => {
    const picker = readProjectFile("src/features/editor/components/DiaryPreludePicker.vue");
    const copyMap = readProjectFile("src/features/editor/constants/diaryPreludeButtonCopy.ts");

    expect(picker).toContain('const copy = computed(() => t(settingsStore.locale));');
    expect(picker).toContain("copy.editor.diaryPreludeTitle");
    expect(picker).toContain("diaryPreludeButtonCopyMap");
    expect(copyMap).toContain("export const diaryPreludeButtonCopyMap");
    expect(picker).toContain("copy.value.editor.diaryPreludeHint");
    expect(picker).not.toContain("落笔之前，先拾起今日的碎片");
    expect(picker).not.toContain("带着它写下去");
    expect(picker).not.toContain("可以先跳过。");
  });

  it("routes profile dialogs and sheets through localized copy instead of inline literals", () => {
    const profilePage = readProjectFile("src/features/profile/pages/ProfilePage.vue");

    expect(profilePage).toContain(":confirm-text=\"inputDialogConfirmText\"");
    expect(profilePage).toContain(":cancel-text=\"inputDialogCancelText\"");
    expect(profilePage).toContain("copy.value.profile.avatarSheetTitle");
    expect(profilePage).toContain("copy.value.profile.profileSheetTitle");
    expect(profilePage).toContain("copy.value.profile.aboutCopy");
    expect(profilePage).not.toContain('return "头像";');
    expect(profilePage).not.toContain('return "资料";');
    expect(profilePage).not.toContain("把这间角落调到自己最舒服的阅读节奏。");
  });
});
