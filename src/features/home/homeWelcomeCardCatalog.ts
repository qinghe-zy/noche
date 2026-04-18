import homeWelcomeCardCatalogRaw from "../../../docs/每日小卡片数据_结构化提取版_替换润色文案 (1).md?raw";

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

function isHomeWelcomeCardType(value: string): value is HomeWelcomeCardType {
  return ["today_quote", "mood_response", "weather_season", "playful_draw", "action_prompt"].includes(value);
}

function normalizeStringValue<T extends string>(value: unknown, allowedValues: readonly T[], fallback: T): T {
  return typeof value === "string" && allowedValues.includes(value as T) ? (value as T) : fallback;
}

function parseHomeWelcomeCard(record: unknown): HomeWelcomeCard | null {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const source = record as Record<string, unknown>;

  if (typeof source.id !== "string" || typeof source.content !== "string" || !isHomeWelcomeCardType(source.type as string)) {
    return null;
  }

  return {
    id: source.id,
    content: source.content,
    type: source.type as HomeWelcomeCardType,
    moodTag: normalizeStringValue(source.mood_tag, ["none", "calm", "happy", "low", "relaxed", "tired"], "none"),
    weatherTag: normalizeStringValue(source.weather_tag, ["none", "cloudy", "rainy", "sunny", "windy"], "none"),
    timeTag: normalizeStringValue(source.time_tag, ["none", "afternoon", "late_night", "morning", "night"], "none"),
    seasonTag: normalizeStringValue(source.season_tag, ["none", "autumn", "spring", "summer", "winter"], "none"),
    actionTarget: normalizeStringValue(source.action_target, ["none", "diary", "future_letter", "jotting"], "none"),
    triggerMode: normalizeStringValue(source.trigger_mode, ["conditional_priority", "must_trigger", "random"], "random"),
    cooldownDays: typeof source.cooldown_days === "number" ? source.cooldown_days : 0,
    rarity: normalizeStringValue(source.rarity, ["common", "rare", "special"], "common"),
    isActive: source.is_active !== false,
    solarTerms: extractSolarTermsFromContent(source.content),
  };
}

function parseHomeWelcomeCardCatalog(rawValue: string): HomeWelcomeCard[] {
  const jsonBlockPattern = /```json\s*([\s\S]*?)```/g;
  const cards: HomeWelcomeCard[] = [];
  const seenIds = new Set<string>();

  for (const match of rawValue.matchAll(jsonBlockPattern)) {
    const jsonBlock = match[1]?.trim();

    if (!jsonBlock) {
      continue;
    }

    try {
      const parsed = JSON.parse(jsonBlock) as unknown;

      if (!Array.isArray(parsed)) {
        continue;
      }

      for (const item of parsed) {
        const card = parseHomeWelcomeCard(item);

        if (!card || seenIds.has(card.id)) {
          continue;
        }

        cards.push(card);
        seenIds.add(card.id);
      }
    } catch {
      continue;
    }
  }

  return cards;
}

const HOME_WELCOME_CARDS = parseHomeWelcomeCardCatalog(homeWelcomeCardCatalogRaw);
const HOME_WELCOME_CARD_BY_ID = new Map(HOME_WELCOME_CARDS.map((card) => [card.id, card]));

export function readHomeWelcomeCards(): HomeWelcomeCard[] {
  return HOME_WELCOME_CARDS;
}

export function readHomeWelcomeCardById(cardId: string): HomeWelcomeCard | null {
  return HOME_WELCOME_CARD_BY_ID.get(cardId) ?? null;
}
