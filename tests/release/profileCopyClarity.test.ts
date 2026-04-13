import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("profile copy clarity", () => {
  it("uses background-image wording instead of the less obvious cover-image wording in user-facing copy", () => {
    const i18n = readProjectFile("src/shared/i18n.ts");
    const profileIdentity = readProjectFile("src/features/profile/composables/useProfileIdentity.ts");

    expect(i18n).toContain('coverSheetTitle: "背景图"');
    expect(i18n).toContain('coverDelete: "删除背景图"');
    expect(profileIdentity).toContain('保存背景图失败。');
    expect(i18n).not.toContain('coverSheetTitle: "头图"');
    expect(profileIdentity).not.toContain("保存头图失败。");
  });

  it("shows the about section as an author note instead of technical runtime descriptors", () => {
    const i18n = readProjectFile("src/shared/i18n.ts");

    expect(i18n).toContain("作者寄语：相遇本身，就是时间写下的一封信。");
    expect(i18n).toContain("很高兴这款略显简陋的信箱，能成为你安放此刻、投递未来的地方。");
    expect(i18n).toContain("愿你在这里留下的每一次回声，都能在未来收到最好的回信。");
    expect(i18n).toContain("—— Qinghe");
    expect(i18n).not.toContain("Android / local-first / 离线可写。");
  });
});
