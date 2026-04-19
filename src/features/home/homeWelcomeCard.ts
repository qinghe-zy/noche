import dayjs from "dayjs";
import { createUniJsonStorage, type JsonStorage } from "@/shared/utils/storage";
import {
  readHomeWelcomeCardById,
  readHomeWelcomeCards,
  type HomeWelcomeCard,
  type HomeWelcomeCardType,
  type HomeWelcomeCardTriggerMode,
} from "@/features/home/homeWelcomeCardCatalog";
import { resolveHomeWelcomeCardTheme } from "@/features/home/homeWelcomeCardTheme";
import { isDateKeyOnSolarTerm } from "@/features/home/homeWelcomeCardSolarTerms";

export type { HomeWelcomeCard, HomeWelcomeCardType } from "@/features/home/homeWelcomeCardCatalog";
export { readHomeWelcomeCards, resolveHomeWelcomeCardTheme };

export interface HomeWelcomeCardCollectionRecord {
  cardId: string;
  collectedAt: string;
  collectedDateKey: string;
  type: HomeWelcomeCardType;
}

export interface HomeWelcomeCardHistoryRecord {
  cardId: string;
  dateKey: string;
  resolvedAt: string;
  type: HomeWelcomeCardType;
}

interface ResolveHomeWelcomeCardOptions {
  storage?: JsonStorage;
}

export const HOME_WELCOME_CARD_STORAGE_KEY = "home-welcome-card:last-seen-date";
export const HOME_WELCOME_CARD_COLLECTION_STORAGE_KEY = "home-welcome-card:collection-records";
export const HOME_WELCOME_CARD_HISTORY_STORAGE_KEY = "home-welcome-card:history-records";

const HOME_WELCOME_CARD_TRIGGER_PRIORITY: Record<HomeWelcomeCardTriggerMode, number> = {
  must_trigger: 0,
  conditional_priority: 1,
  random: 2,
};

function hashDate(dateKey: string): number {
  return dateKey.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function sortDateDescending<T extends { dateKey: string }>(records: T[]): T[] {
  return [...records].sort((left, right) => right.dateKey.localeCompare(left.dateKey));
}

function sortCollectedDescending(records: HomeWelcomeCardCollectionRecord[]): HomeWelcomeCardCollectionRecord[] {
  return [...records].sort((left, right) => {
    if (left.collectedAt !== right.collectedAt) {
      return right.collectedAt.localeCompare(left.collectedAt);
    }

    return right.collectedDateKey.localeCompare(left.collectedDateKey);
  });
}

function readRawJsonValue(key: string, storage: JsonStorage): unknown {
  const rawValue = storage.getString(key);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    return null;
  }
}

function normalizeCollectionRecord(record: unknown): HomeWelcomeCardCollectionRecord | null {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const source = record as Record<string, unknown>;

  if (
    typeof source.cardId !== "string"
    || typeof source.collectedAt !== "string"
    || typeof source.collectedDateKey !== "string"
    || typeof source.type !== "string"
  ) {
    return null;
  }

  const card = readHomeWelcomeCardById(source.cardId);

  if (!card) {
    return null;
  }

  return {
    cardId: source.cardId,
    collectedAt: source.collectedAt,
    collectedDateKey: source.collectedDateKey,
    type: card.type,
  };
}

function normalizeLegacyCollectionRecords(records: Record<string, unknown>): HomeWelcomeCardCollectionRecord[] {
  return Object.entries(records).flatMap(([dateKey, cardId]) => {
    if (typeof cardId !== "string") {
      return [];
    }

    const card = readHomeWelcomeCardById(cardId);

    if (!card) {
      return [];
    }

    return [{
      cardId,
      collectedAt: `${dateKey}T00:00:00.000Z`,
      collectedDateKey: dateKey,
      type: card.type,
    }];
  });
}

function writeCollectionRecords(records: HomeWelcomeCardCollectionRecord[], storage: JsonStorage): void {
  storage.setString(HOME_WELCOME_CARD_COLLECTION_STORAGE_KEY, JSON.stringify(records));
}

function normalizeHistoryRecord(record: unknown): HomeWelcomeCardHistoryRecord | null {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    return null;
  }

  const source = record as Record<string, unknown>;

  if (
    typeof source.cardId !== "string"
    || typeof source.dateKey !== "string"
    || typeof source.resolvedAt !== "string"
    || typeof source.type !== "string"
  ) {
    return null;
  }

  const card = readHomeWelcomeCardById(source.cardId);

  if (!card) {
    return null;
  }

  return {
    cardId: source.cardId,
    dateKey: source.dateKey,
    resolvedAt: source.resolvedAt,
    type: card.type,
  };
}

function writeHistoryRecords(records: HomeWelcomeCardHistoryRecord[], storage: JsonStorage): void {
  storage.setString(HOME_WELCOME_CARD_HISTORY_STORAGE_KEY, JSON.stringify(records));
}

function buildEligibleCardPool(dateKey: string, history: HomeWelcomeCardHistoryRecord[], collectedIds: Set<string>): HomeWelcomeCard[] {
  const previousHistory = history
    .filter((record) => record.dateKey < dateKey)
    .sort((left, right) => right.dateKey.localeCompare(left.dateKey));
  const lastTwoTypes = previousHistory.slice(0, 2);
  const typeLimit = lastTwoTypes.length === 2 && lastTwoTypes.every((record) => record.type === lastTwoTypes[0]?.type)
    ? lastTwoTypes[0]?.type
    : null;

  return readHomeWelcomeCards().filter((card) => {
    if (!card.isActive || collectedIds.has(card.id)) {
      return false;
    }

    if (typeLimit && card.type === typeLimit) {
      return false;
    }

    if (!isHomeWelcomeCardAvailableOnDate(card, dateKey)) {
      return false;
    }

    const recentlyShown = previousHistory.some((record) => {
      if (record.cardId !== card.id) {
        return false;
      }

      return dayjs(dateKey).diff(dayjs(record.dateKey), "day") < card.cooldownDays;
    });

    return !recentlyShown;
  });
}

export function isHomeWelcomeCardAvailableOnDate(card: HomeWelcomeCard, dateKey: string): boolean {
  if (!card.solarTerms.length) {
    return true;
  }

  return card.solarTerms.some((solarTerm) => isDateKeyOnSolarTerm(dateKey, solarTerm));
}

function prioritizeEligibleCards(cards: HomeWelcomeCard[]): HomeWelcomeCard[] {
  const sortedByPriority = [...cards].sort((left, right) => {
    const priorityGap = HOME_WELCOME_CARD_TRIGGER_PRIORITY[left.triggerMode] - HOME_WELCOME_CARD_TRIGGER_PRIORITY[right.triggerMode];

    if (priorityGap !== 0) {
      return priorityGap;
    }

    return left.id.localeCompare(right.id);
  });
  const highestPriority = HOME_WELCOME_CARD_TRIGGER_PRIORITY[sortedByPriority[0]?.triggerMode ?? "random"];

  return sortedByPriority.filter((card) => HOME_WELCOME_CARD_TRIGGER_PRIORITY[card.triggerMode] === highestPriority);
}

export function resolveHomeWelcomeCard(dateKey: string, options: ResolveHomeWelcomeCardOptions = {}): HomeWelcomeCard {
  const storage = options.storage ?? createUniJsonStorage();
  const history = readHomeWelcomeCardHistory(storage);
  const existingRecord = history.find((record) => record.dateKey === dateKey);

  if (existingRecord) {
    return readHomeWelcomeCardById(existingRecord.cardId) ?? readHomeWelcomeCards()[0];
  }

  const collectedIds = new Set(readHomeWelcomeCardCollection(storage).map((record) => record.cardId));
  const eligibleCards = buildEligibleCardPool(dateKey, history, collectedIds);
  const fallbackCards = readHomeWelcomeCards().filter((card) => card.isActive && !collectedIds.has(card.id));
  const prioritizedCards = prioritizeEligibleCards(eligibleCards.length ? eligibleCards : fallbackCards);
  const selectedCards = prioritizedCards.length ? prioritizedCards : readHomeWelcomeCards();
  const index = hashDate(dateKey) % selectedCards.length;

  return selectedCards[index] ?? selectedCards[0] ?? readHomeWelcomeCards()[0];
}

export function resolveHomeWelcomeCardEyebrow(type: HomeWelcomeCardType, locale: string): string {
  const isEnglish = locale === "en-US";

  if (type === "mood_response") {
    return isEnglish ? "MOOD EDIT" : "情绪辑录";
  }

  if (type === "weather_season") {
    return isEnglish ? "SEASON FRAME" : "时令镜头";
  }

  if (type === "playful_draw") {
    return isEnglish ? "PLAYFUL DRAW" : "今日抽签";
  }

  if (type === "action_prompt") {
    return isEnglish ? "ACTION NOTE" : "今日行动";
  }

  return isEnglish ? "FEATURED NOTE" : "今日摘句";
}

export function resolveHomeWelcomeCardTitle(type: HomeWelcomeCardType, locale: string): string {
  const isEnglish = locale === "en-US";

  if (type === "mood_response") {
    return isEnglish ? "Inner\nWeather" : "此刻\n心绪";
  }

  if (type === "weather_season") {
    return isEnglish ? "Season\nSignal" : "天气\n时令";
  }

  if (type === "playful_draw") {
    return isEnglish ? "Lucky\nDraw" : "今日\n小签";
  }

  if (type === "action_prompt") {
    return isEnglish ? "Small\nAction" : "轻写\n一下";
  }

  return isEnglish ? "Daily\nCard" : "今日\n卡片";
}

export function resolveHomeWelcomeCardGlyph(type: HomeWelcomeCardType): string {
  return resolveHomeWelcomeCardTheme(type).icon;
}

export function resolveHomeWelcomeCardSequence(card: HomeWelcomeCard): string {
  const digits = card.id.match(/\d+/)?.[0] ?? "001";
  return digits.slice(-3).padStart(3, "0");
}

export function shouldAutoShowHomeWelcomeCard(dateKey: string, lastSeenDate: string | null): boolean {
  void dateKey;
  void lastSeenDate;
  return true;
}

export function readHomeWelcomeCardSeenDate(storage: JsonStorage = createUniJsonStorage()): string | null {
  return storage.getString(HOME_WELCOME_CARD_STORAGE_KEY);
}

export function markHomeWelcomeCardSeen(dateKey: string, storage: JsonStorage = createUniJsonStorage()): void {
  storage.setString(HOME_WELCOME_CARD_STORAGE_KEY, dateKey);
}

export function readHomeWelcomeCardCollection(storage: JsonStorage = createUniJsonStorage()): HomeWelcomeCardCollectionRecord[] {
  const parsed = readRawJsonValue(HOME_WELCOME_CARD_COLLECTION_STORAGE_KEY, storage);

  if (Array.isArray(parsed)) {
    return sortCollectedDescending(parsed.map(normalizeCollectionRecord).filter((record): record is HomeWelcomeCardCollectionRecord => record !== null));
  }

  if (parsed && typeof parsed === "object") {
    return sortCollectedDescending(normalizeLegacyCollectionRecords(parsed as Record<string, unknown>));
  }

  return [];
}

export function readHomeWelcomeCardCollectionCount(storage: JsonStorage = createUniJsonStorage()): number {
  return readHomeWelcomeCardCollection(storage).length;
}

export function isHomeWelcomeCardCollected(
  dateKey: string,
  cardId: string,
  storage: JsonStorage = createUniJsonStorage(),
): boolean {
  void dateKey;
  return readHomeWelcomeCardCollection(storage).some((record) => record.cardId === cardId);
}

export function markHomeWelcomeCardCollected(
  dateKey: string,
  cardId: string,
  storage: JsonStorage = createUniJsonStorage(),
  collectedAt = new Date().toISOString(),
): void {
  const card = readHomeWelcomeCardById(cardId);

  if (!card) {
    return;
  }

  const existingRecords = readHomeWelcomeCardCollection(storage).filter((record) => record.cardId !== cardId);
  existingRecords.push({
    cardId,
    collectedAt,
    collectedDateKey: dateKey,
    type: card.type,
  });
  writeCollectionRecords(sortCollectedDescending(existingRecords), storage);
}

export function removeHomeWelcomeCardCollected(
  cardId: string,
  storage: JsonStorage = createUniJsonStorage(),
): void {
  const nextRecords = readHomeWelcomeCardCollection(storage).filter((record) => record.cardId !== cardId);
  writeCollectionRecords(sortCollectedDescending(nextRecords), storage);
}

export function readHomeWelcomeCardHistory(storage: JsonStorage = createUniJsonStorage()): HomeWelcomeCardHistoryRecord[] {
  const parsed = readRawJsonValue(HOME_WELCOME_CARD_HISTORY_STORAGE_KEY, storage);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return sortDateDescending(parsed.map(normalizeHistoryRecord).filter((record): record is HomeWelcomeCardHistoryRecord => record !== null));
}

export function markHomeWelcomeCardResolved(
  dateKey: string,
  cardId: string,
  storage: JsonStorage = createUniJsonStorage(),
  resolvedAt = new Date().toISOString(),
): void {
  const card = readHomeWelcomeCardById(cardId);

  if (!card) {
    return;
  }

  const existingRecords = readHomeWelcomeCardHistory(storage).filter((record) => record.dateKey !== dateKey);
  existingRecords.push({
    cardId,
    dateKey,
    resolvedAt,
    type: card.type,
  });
  writeHistoryRecords(sortDateDescending(existingRecords), storage);
}
