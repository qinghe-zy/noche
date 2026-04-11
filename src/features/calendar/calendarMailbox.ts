import dayjs from "dayjs";
import type { Entry } from "@/domain/entry/types";

export type CalendarMailboxStateKind = "entries" | "empty-past" | "empty-today" | "empty-future";

export interface CalendarMailboxState {
  kind: CalendarMailboxStateKind;
  title: string;
  body: string;
  actionLabel: string | null;
}

type CalendarCopyVariant = {
  title: string;
  body: (formattedDate: string) => string;
};

const ENTRY_VARIANTS: CalendarCopyVariant[] = [
  {
    title: "这一天，落笔有痕。",
    body: (formattedDate) => `${formattedDate} 的思绪已安放于此。拆开下方的信笺，再去听听那时的声音。`,
  },
  {
    title: "旧日有信，见字如面。",
    body: (formattedDate) => `${formattedDate} 的故事已折叠妥当。展信佳，欢迎重温那一日的只言片语。`,
  },
  {
    title: "记忆停泊于此。",
    body: (formattedDate) => `${formattedDate} 的光阴已被妥善珍藏。拾起任意一封，便能重新走入那段岁月。`,
  },
];

const EMPTY_VARIANTS: CalendarCopyVariant[] = [
  {
    title: "这一日的时光，尚且留白。",
    body: (formattedDate) => `${formattedDate} 的风声与心绪还未曾被写下。若你愿意，随时可以提笔，补齐那段错过的回忆。`,
  },
  {
    title: "纸笺泛白，静候回音。",
    body: (formattedDate) => `${formattedDate} 的信箱依然空空如也。光阴虽已走远，但这一页信纸仍为你平铺，等候迟来的落笔。`,
  },
  {
    title: "光阴无声，此页空缺。",
    body: (formattedDate) => `属于 ${formattedDate} 的故事尚未落笔。轻启信笺，即可寻回并补写那一日的岁月。`,
  },
];

function isFutureDate(recordDate: string, today: string): boolean {
  return dayjs(recordDate).startOf("day").valueOf() > dayjs(today).startOf("day").valueOf();
}

function isToday(recordDate: string, today: string): boolean {
  return dayjs(recordDate).startOf("day").valueOf() === dayjs(today).startOf("day").valueOf();
}

function formatMailboxDate(recordDate: string): string {
  return dayjs(recordDate).format("YYYY.MM.DD");
}

function pickVariant(variants: CalendarCopyVariant[], variantIndex: number): CalendarCopyVariant {
  return variants[Math.abs(variantIndex) % variants.length] ?? variants[0];
}

export function resolveCalendarMailboxState(
  recordDate: string,
  entries: Entry[],
  today: string,
  variantIndex = 0,
): CalendarMailboxState {
  const formattedDate = formatMailboxDate(recordDate);

  if (entries.length > 0) {
    const variant = pickVariant(ENTRY_VARIANTS, variantIndex);

    return {
      kind: "entries",
      title: variant.title,
      body: variant.body(formattedDate),
      actionLabel: null,
    };
  }

  if (isFutureDate(recordDate, today)) {
    return {
      kind: "empty-future",
      title: "这一天还没有可查看的信",
      body: `${formattedDate} 还没有等到你可以翻开的那一封信。`,
      actionLabel: null,
    };
  }

  const variant = pickVariant(EMPTY_VARIANTS, variantIndex);

  if (isToday(recordDate, today)) {
    return {
      kind: "empty-today",
      title: variant.title,
      body: variant.body(formattedDate),
      actionLabel: "打开今日信纸",
    };
  }

  return {
    kind: "empty-past",
    title: variant.title,
    body: variant.body(formattedDate),
    actionLabel: "补写这一天的日记",
  };
}
