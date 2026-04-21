export type DarkShellTabId = "today" | "jotting" | "future" | "mailbox";

export interface DarkShellTab {
  id: DarkShellTabId;
  labelZh: string;
  labelEn: string;
  symbol: "◎" | "✒" | "✉" | "◫";
}

export const DARK_SHELL_TABS: DarkShellTab[] = [
  { id: "today", labelZh: "今日", labelEn: "Today", symbol: "◎" },
  { id: "jotting", labelZh: "随笔", labelEn: "Jotting", symbol: "✒" },
  { id: "future", labelZh: "致未来", labelEn: "Future", symbol: "✉" },
  { id: "mailbox", labelZh: "邮箱", labelEn: "Mailbox", symbol: "◫" },
];

export function getDarkShellTabById(id: DarkShellTabId): DarkShellTab {
  return DARK_SHELL_TABS.find((tab) => tab.id === id) ?? DARK_SHELL_TABS[0];
}
