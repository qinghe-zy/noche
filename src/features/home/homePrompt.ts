export interface HomeDailyPrompt {
  primaryZh: string;
  primaryEn: string;
  subtitleZh: string;
  subtitleEn: string;
}

const HOME_DAILY_PROMPTS: HomeDailyPrompt[] = [
  { primaryZh: "存放今日", primaryEn: "Store today", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "安放此刻", primaryEn: "Settle this moment", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "拾取今日片段", primaryEn: "Gather today's fragments", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "停靠在今日的扉页", primaryEn: "Dock at today's first page", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "唤醒今日的空白", primaryEn: "Wake today's blank page", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "摊开此刻的心绪", primaryEn: "Unfold this moment's thoughts", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "展开今日留白", primaryEn: "Open today's margin", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "执笔今日", primaryEn: "Write today", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "落笔此刻", primaryEn: "Write this moment", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "铺开今日的纸页", primaryEn: "Lay out today's page", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "在今日的坐标落笔", primaryEn: "Write at today's coordinates", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "启封今日", primaryEn: "Unseal today", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "翻开时间的折页", primaryEn: "Turn open time's fold", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "裁下一截今日的时光", primaryEn: "Keep a slice of today", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "沉淀", primaryEn: "Settle", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "纪实", primaryEn: "Record", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "落笔", primaryEn: "Write", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "展卷", primaryEn: "Unfold", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "启页", primaryEn: "Open the page", subtitleZh: "致今日", subtitleEn: "To Today" },
  { primaryZh: "致今日", primaryEn: "To Today", subtitleZh: "致今日", subtitleEn: "To Today" },
];

function hashDate(dateKey: string): number {
  return dateKey.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

export function resolveHomeDailyPrompt(dateKey: string): HomeDailyPrompt {
  const index = hashDate(dateKey) % HOME_DAILY_PROMPTS.length;
  return HOME_DAILY_PROMPTS[index] ?? HOME_DAILY_PROMPTS[0];
}
