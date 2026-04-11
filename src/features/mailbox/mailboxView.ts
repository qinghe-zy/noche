import type { EntryType } from "@/domain/entry/types";

export type MailboxPrimaryTab = "documentary" | "distant";
export type MailboxSecondaryTab = "diary" | "jotting" | "opened" | "pending";

export interface MailboxSecondaryOption {
  value: MailboxSecondaryTab;
  label: string;
}

export function getMailboxSecondaryOptions(
  primary: MailboxPrimaryTab,
): MailboxSecondaryOption[] {
  if (primary === "documentary") {
    return [
      { value: "diary", label: "日记" },
      { value: "jotting", label: "随笔" },
    ];
  }

  return [
    { value: "pending", label: "待启" },
    { value: "opened", label: "已启" },
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
