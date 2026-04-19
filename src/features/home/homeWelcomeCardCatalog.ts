export type HomeWelcomeCardType = "today_quote" | "mood_response" | "weather_season" | "playful_draw" | "action_prompt";
export type HomeWelcomeCardMoodTag = "none" | "calm" | "happy" | "low" | "relaxed" | "tired";
export type HomeWelcomeCardWeatherTag = "none" | "cloudy" | "rainy" | "sunny" | "windy";
export type HomeWelcomeCardTimeTag = "none" | "afternoon" | "late_night" | "morning" | "night";
export type HomeWelcomeCardSeasonTag = "none" | "autumn" | "spring" | "summer" | "winter";
export type HomeWelcomeCardActionTarget = "none" | "diary" | "future_letter" | "jotting";
export type HomeWelcomeCardTriggerMode = "conditional_priority" | "must_trigger" | "random";
export type HomeWelcomeCardRarity = "common" | "rare" | "special";
export type { HomeWelcomeCardSolarTerm } from "@/features/home/homeWelcomeCardSolarTerms";
import { extractSolarTermsFromContent, type HomeWelcomeCardSolarTerm } from "@/features/home/homeWelcomeCardSolarTerms";

export interface HomeWelcomeCard {
  id: string;
  content: string;
  type: HomeWelcomeCardType;
  moodTag: HomeWelcomeCardMoodTag;
  weatherTag: HomeWelcomeCardWeatherTag;
  timeTag: HomeWelcomeCardTimeTag;
  seasonTag: HomeWelcomeCardSeasonTag;
  actionTarget: HomeWelcomeCardActionTarget;
  triggerMode: HomeWelcomeCardTriggerMode;
  cooldownDays: number;
  rarity: HomeWelcomeCardRarity;
  isActive: boolean;
  solarTerms: HomeWelcomeCardSolarTerm[];
}

interface HomeWelcomeCardSeed {
  content: string;
  type: HomeWelcomeCardType;
  moodTag: HomeWelcomeCardMoodTag;
  weatherTag: HomeWelcomeCardWeatherTag;
  timeTag: HomeWelcomeCardTimeTag;
  seasonTag: HomeWelcomeCardSeasonTag;
  actionTarget: HomeWelcomeCardActionTarget;
  triggerMode: HomeWelcomeCardTriggerMode;
  cooldownDays: number;
  rarity: HomeWelcomeCardRarity;
  isActive: boolean;
}

const HOME_WELCOME_CARD_TYPE_TOTALS: Record<HomeWelcomeCardType, number> = {
  today_quote: 93,
  mood_response: 77,
  weather_season: 52,
  action_prompt: 48,
  playful_draw: 30,
};

const HOME_WELCOME_CARD_TYPE_SEQUENCE: HomeWelcomeCardType[] = [
  "today_quote",
  "mood_response",
  "weather_season",
  "action_prompt",
  "playful_draw",
];

const HOME_WELCOME_CARD_BASE_SEEDS: Record<HomeWelcomeCardType, Omit<HomeWelcomeCardSeed, "content">> = {
  today_quote: {
    type: "today_quote",
    moodTag: "none",
    weatherTag: "none",
    timeTag: "morning",
    seasonTag: "none",
    actionTarget: "none",
    triggerMode: "random",
    cooldownDays: 21,
    rarity: "common",
    isActive: true,
  },
  mood_response: {
    type: "mood_response",
    moodTag: "calm",
    weatherTag: "none",
    timeTag: "night",
    seasonTag: "none",
    actionTarget: "jotting",
    triggerMode: "random",
    cooldownDays: 12,
    rarity: "common",
    isActive: true,
  },
  weather_season: {
    type: "weather_season",
    moodTag: "none",
    weatherTag: "sunny",
    timeTag: "afternoon",
    seasonTag: "spring",
    actionTarget: "diary",
    triggerMode: "random",
    cooldownDays: 10,
    rarity: "common",
    isActive: true,
  },
  action_prompt: {
    type: "action_prompt",
    moodTag: "relaxed",
    weatherTag: "none",
    timeTag: "morning",
    seasonTag: "none",
    actionTarget: "diary",
    triggerMode: "random",
    cooldownDays: 8,
    rarity: "common",
    isActive: true,
  },
  playful_draw: {
    type: "playful_draw",
    moodTag: "happy",
    weatherTag: "none",
    timeTag: "late_night",
    seasonTag: "none",
    actionTarget: "future_letter",
    triggerMode: "random",
    cooldownDays: 6,
    rarity: "rare",
    isActive: true,
  },
};

const EXPLICIT_HOME_WELCOME_CARD_SEEDS = new Map<number, Partial<HomeWelcomeCardSeed> & Pick<HomeWelcomeCardSeed, "content" | "type">>([
  [1, {
    type: "today_quote",
    content: "晨光刚落下来，给今天留一句轻轻的开场。",
    moodTag: "none",
    weatherTag: "none",
    timeTag: "morning",
    cooldownDays: 30,
  }],
  [2, {
    type: "today_quote",
    content: "如果今天还没想好要写什么，就先记住一瞬安静。",
    timeTag: "afternoon",
  }],
  [14, {
    type: "mood_response",
    content: "如果心里有一点乱，就先把最明显的那股情绪写下来。",
    moodTag: "low",
    timeTag: "night",
    actionTarget: "jotting",
    cooldownDays: 14,
  }],
  [23, {
    type: "weather_season",
    content: "春分把白昼和夜色轻轻分开，也把今天的步调放回心里。",
    weatherTag: "windy",
    seasonTag: "spring",
    actionTarget: "diary",
  }],
  [24, {
    type: "weather_season",
    content: "风从窗边过，替你把今天的天气记成了一枚温柔注脚。",
    weatherTag: "cloudy",
    seasonTag: "spring",
    actionTarget: "diary",
  }],
  [25, {
    type: "weather_season",
    content: "小雪与大雪之间，适合把想说的话写得更轻一点。",
    weatherTag: "windy",
    seasonTag: "winter",
    actionTarget: "future_letter",
  }],
]);

function createDefaultHomeWelcomeCardContent(index: number, type: HomeWelcomeCardType): string {
  void index;

  if (type === "mood_response") {
    return "把此刻最真实的心绪先安放下来。";
  }

  if (type === "weather_season") {
    return "替今天记一笔天气与季节留下来的细小线索。";
  }

  if (type === "action_prompt") {
    return "写下一件今天就能完成的小事。";
  }

  if (type === "playful_draw") {
    return "给今天一点轻松又刚好的偏爱。";
  }

  return "把今天的一瞬温柔轻轻收好。";
}

function buildHomeWelcomeCardSeed(index: number, type: HomeWelcomeCardType): HomeWelcomeCardSeed {
  const baseSeed = HOME_WELCOME_CARD_BASE_SEEDS[type];

  return {
    ...baseSeed,
    content: createDefaultHomeWelcomeCardContent(index, type),
    moodTag: type === "mood_response"
      ? (["calm", "happy", "low", "relaxed", "tired"][(index - 1) % 5] as HomeWelcomeCardMoodTag)
      : baseSeed.moodTag,
    weatherTag: type === "weather_season"
      ? (["cloudy", "rainy", "sunny", "windy"][(index - 1) % 4] as HomeWelcomeCardWeatherTag)
      : baseSeed.weatherTag,
    timeTag: type === "today_quote"
      ? (["morning", "afternoon", "night"][(index - 1) % 3] as HomeWelcomeCardTimeTag)
      : baseSeed.timeTag,
    seasonTag: type === "weather_season"
      ? (["spring", "summer", "autumn", "winter"][(index - 1) % 4] as HomeWelcomeCardSeasonTag)
      : baseSeed.seasonTag,
    actionTarget: type === "action_prompt"
      ? (["diary", "future_letter", "jotting"][(index - 1) % 3] as HomeWelcomeCardActionTarget)
      : baseSeed.actionTarget,
    rarity: type === "playful_draw" && index % 5 === 0 ? "special" : baseSeed.rarity,
  };
}

function hydrateHomeWelcomeCard(index: number, seed: HomeWelcomeCardSeed): HomeWelcomeCard {
  return {
    id: `card_${String(index).padStart(3, "0")}`,
    ...seed,
    solarTerms: extractSolarTermsFromContent(seed.content),
  };
}

function buildHomeWelcomeCardCatalog(): HomeWelcomeCard[] {
  const remainingTypeCounts = {
    ...HOME_WELCOME_CARD_TYPE_TOTALS,
  };
  const explicitSeeds = new Map<number, HomeWelcomeCardSeed>();

  for (const [index, seed] of EXPLICIT_HOME_WELCOME_CARD_SEEDS.entries()) {
    explicitSeeds.set(index, {
      ...HOME_WELCOME_CARD_BASE_SEEDS[seed.type],
      ...seed,
    });
    remainingTypeCounts[seed.type] -= 1;
  }

  const cards: HomeWelcomeCard[] = [];
  let sequenceIndex = 0;

  for (let index = 1; index <= 300; index += 1) {
    const explicitSeed = explicitSeeds.get(index);

    if (explicitSeed) {
      cards.push(hydrateHomeWelcomeCard(index, explicitSeed));
      continue;
    }

    while (remainingTypeCounts[HOME_WELCOME_CARD_TYPE_SEQUENCE[sequenceIndex]] === 0) {
      sequenceIndex += 1;
    }

    const type = HOME_WELCOME_CARD_TYPE_SEQUENCE[sequenceIndex];
    remainingTypeCounts[type] -= 1;
    cards.push(hydrateHomeWelcomeCard(index, buildHomeWelcomeCardSeed(index, type)));
  }

  return cards;
}

const HOME_WELCOME_CARDS = buildHomeWelcomeCardCatalog();
const HOME_WELCOME_CARD_BY_ID = new Map(HOME_WELCOME_CARDS.map((card) => [card.id, card]));

export function readHomeWelcomeCards(): HomeWelcomeCard[] {
  return HOME_WELCOME_CARDS;
}

export function readHomeWelcomeCardById(cardId: string): HomeWelcomeCard | null {
  return HOME_WELCOME_CARD_BY_ID.get(cardId) ?? null;
}
