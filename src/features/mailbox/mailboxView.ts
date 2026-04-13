import type { EntryType } from "@/domain/entry/types";

export type MailboxPrimaryTab = "documentary" | "distant";
export type MailboxSecondaryTab = "diary" | "jotting" | "opened" | "pending";

export interface MailboxSecondaryOption {
  value: MailboxSecondaryTab;
  label: string;
}

export function getMailboxSecondaryOptions(
  primary: MailboxPrimaryTab,
  locale = "zh-CN",
): MailboxSecondaryOption[] {
  const isEnglish = locale === "en-US";
  if (primary === "documentary") {
    return [
      { value: "diary", label: isEnglish ? "Diary" : "日记" },
      { value: "jotting", label: isEnglish ? "Jotting" : "随笔" },
    ];
  }

  return [
    { value: "pending", label: isEnglish ? "Pending" : "待启" },
    { value: "opened", label: isEnglish ? "Opened" : "已启" },
  ];
}

export function getDefaultMailboxSecondaryTab(
  primary: MailboxPrimaryTab,
): MailboxSecondaryTab {
  return primary === "documentary" ? "diary" : "pending";
}

export function resolveMailboxComposeType(
  secondary: MailboxSecondaryTab,
): EntryType {
  if (secondary === "diary") {
    return "diary";
  }

  if (secondary === "jotting") {
    return "jotting";
  }

  return "future";
}
