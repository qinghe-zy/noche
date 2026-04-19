import { createUniJsonStorage, type JsonStorage } from "@/shared/utils/storage";
import type { HomeWelcomeCardType } from "@/features/home/homeWelcomeCardCatalog";
import {
  collectRecentDiaryPreludeContext,
  type RemoteHomeWelcomeCardPromptContext,
} from "@/features/home/homeWelcomeCardRemoteContext";

export const HOME_WELCOME_CARD_REMOTE_CACHE_KEY = "home-welcome-card:remote-cache";
export const HOME_WELCOME_CARD_REMOTE_TIMEOUT_MS = 3500;
const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";

export interface RemoteHomeWelcomeCardRecord {
  id: string;
  dateKey: string;
  locale: string;
  content: string;
  type: HomeWelcomeCardType;
  generatedAt: string;
}

export interface RemoteHomeWelcomeCardRequestConfig {
  apiKey?: string | null;
  baseUrl?: string | null;
  model?: string | null;
}

export interface RemoteHomeWelcomeCardPrefetchOptions extends RemoteHomeWelcomeCardRequestConfig {
  context?: RemoteHomeWelcomeCardPromptContext | null;
  requestFn?: ((options: {
    url: string;
    method: "POST";
    header: Record<string, string>;
    data: unknown;
    timeout: number;
    success: (result: { statusCode: number; data: unknown }) => void;
    fail: (error: unknown) => void;
  }) => void) | null;
  storage?: JsonStorage;
  now?: () => Date;
}

interface DeepSeekChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const pendingRemoteCardRequests = new Map<string, Promise<RemoteHomeWelcomeCardRecord | null>>();
const HOME_WELCOME_CARD_TYPES: HomeWelcomeCardType[] = [
  "today_quote",
  "mood_response",
  "weather_season",
  "playful_draw",
  "action_prompt",
];

function isValidHomeWelcomeCardType(value: string): value is HomeWelcomeCardType {
  return HOME_WELCOME_CARD_TYPES.includes(value as HomeWelcomeCardType);
}

function readRemoteCacheMap(storage: JsonStorage): Record<string, RemoteHomeWelcomeCardRecord> {
  const raw = storage.getString(HOME_WELCOME_CARD_REMOTE_CACHE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, RemoteHomeWelcomeCardRecord>;
  } catch {
    return {};
  }
}

function writeRemoteCacheMap(storage: JsonStorage, records: Record<string, RemoteHomeWelcomeCardRecord>): void {
  storage.setString(HOME_WELCOME_CARD_REMOTE_CACHE_KEY, JSON.stringify(records));
}

function resolveRemoteCacheKey(dateKey: string, locale: string): string {
  return `${locale}:${dateKey}`;
}

export function createRemoteHomeWelcomeCardId(dateKey: string, locale: string): string {
  return `remote_${locale}_${dateKey}`.replace(/[^a-zA-Z0-9_-]/gu, "_");
}

export function readRemoteHomeWelcomeCard(dateKey: string, locale: string, storage: JsonStorage = createUniJsonStorage()): RemoteHomeWelcomeCardRecord | null {
  const record = readRemoteCacheMap(storage)[resolveRemoteCacheKey(dateKey, locale)];
  return record ?? null;
}

export function readRemoteHomeWelcomeCardById(cardId: string, storage: JsonStorage = createUniJsonStorage()): RemoteHomeWelcomeCardRecord | null {
  return Object.values(readRemoteCacheMap(storage)).find((record) => record.id === cardId) ?? null;
}

export function getDeepSeekHomeWelcomeCardConfig(): RemoteHomeWelcomeCardRequestConfig {
  const env = import.meta.env as ImportMetaEnv | undefined;

  return {
    apiKey: env?.VITE_DEEPSEEK_API_KEY?.trim() ?? "",
    baseUrl: env?.VITE_DEEPSEEK_BASE_URL?.trim() ?? DEFAULT_DEEPSEEK_BASE_URL,
    model: env?.VITE_DEEPSEEK_MODEL?.trim() ?? DEFAULT_DEEPSEEK_MODEL,
  };
}

function hasUsableDeepSeekConfig(config: RemoteHomeWelcomeCardRequestConfig): boolean {
  return Boolean(config.apiKey?.trim());
}

function buildDeepSeekRequestMessages(
  dateKey: string,
  locale: string,
  now: Date,
  context: RemoteHomeWelcomeCardPromptContext | null,
) {
  const nowIso = now.toISOString();
  const localizedLanguage = locale === "en-US" ? "English" : "简体中文";

  return [
    {
      role: "system",
      content: [
        `You generate one home welcome card for a quiet personal writing app.`,
        `Output must be valid JSON with exactly two keys: "type" and "content".`,
        `The "type" must be one of: today_quote, mood_response, weather_season, playful_draw, action_prompt.`,
        `The "content" must be a single concise card body in ${localizedLanguage}.`,
        `Do not include numbering, labels, quotation marks, markdown, or phrases like "第几张卡" / "card".`,
        `Keep the tone gentle, local-first, paper-like, and suitable for the current date and time context.`,
        `If recent diary weather or mood context is provided, adapt to it subtly without naming the source data.`,
        `Do not mention AI, models, or generation.`,
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify({
        dateKey,
        locale,
        nowIso,
        appStyle: "quiet paper-like private writing",
        desiredLength: "18-40 Chinese characters or 8-24 English words",
        recentPreludeContext: context,
      }),
    },
  ];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyExpectedRemoteCardKeys(value: Record<string, unknown>): boolean {
  const keys = Object.keys(value).sort();

  return keys.length === 2 && keys[0] === "content" && keys[1] === "type";
}

function sanitizeRemoteCardContent(rawContent: string): string | null {
  const nextContent = rawContent.replace(/\s+/gu, " ").trim();

  if (!nextContent) {
    return null;
  }

  if (
    /```|`[^`]+`|\[[^\]]+\]\([^)]+\)|[*_~#>|]/u.test(nextContent)
    || /^\s*(?:第\s*\d+\s*张卡|card\s*#?\d+|\d+\s*[.)、．])/iu.test(nextContent)
    || /(第\s*\d+\s*张卡|提醒你|卡片提醒你|\bAI\b|模型|\bmodel\b)/iu.test(nextContent)
  ) {
    return null;
  }

  return nextContent;
}

function parseDeepSeekCardResponse(
  responseData: unknown,
  dateKey: string,
  locale: string,
  generatedAt: string,
): RemoteHomeWelcomeCardRecord | null {
  const response = responseData as DeepSeekChatCompletionResponse | undefined;
  const content = response?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as unknown;

    if (!isPlainObject(parsed) || !hasOnlyExpectedRemoteCardKeys(parsed)) {
      return null;
    }

    const nextType = typeof parsed.type === "string" ? parsed.type.trim() : "";
    const nextContent = typeof parsed.content === "string" ? sanitizeRemoteCardContent(parsed.content) : null;

    if (!isValidHomeWelcomeCardType(nextType) || !nextContent) {
      return null;
    }

    return {
      id: createRemoteHomeWelcomeCardId(dateKey, locale),
      dateKey,
      locale,
      content: nextContent,
      type: nextType,
      generatedAt,
    };
  } catch {
    return null;
  }
}

function requestRemoteHomeWelcomeCard(
  dateKey: string,
  locale: string,
  options: Required<Pick<RemoteHomeWelcomeCardPrefetchOptions, "requestFn" | "now">>
    & RemoteHomeWelcomeCardRequestConfig
    & { context: RemoteHomeWelcomeCardPromptContext | null },
): Promise<RemoteHomeWelcomeCardRecord | null> {
  const requestFn = options.requestFn;

  if (!requestFn || !hasUsableDeepSeekConfig(options)) {
    return Promise.resolve(null);
  }

  const generatedAt = options.now().toISOString();

  return new Promise((resolve) => {
    requestFn({
      url: `${(options.baseUrl ?? DEFAULT_DEEPSEEK_BASE_URL).replace(/\/$/u, "")}/chat/completions`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      timeout: HOME_WELCOME_CARD_REMOTE_TIMEOUT_MS,
      data: {
        model: options.model ?? DEFAULT_DEEPSEEK_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.9,
        max_tokens: 160,
        messages: buildDeepSeekRequestMessages(dateKey, locale, options.now(), options.context),
      },
      success: (result) => {
        if (result.statusCode < 200 || result.statusCode >= 300) {
          resolve(null);
          return;
        }

        resolve(parseDeepSeekCardResponse(result.data, dateKey, locale, generatedAt));
      },
      fail: () => resolve(null),
    });
  });
}

function pruneRemoteCache(records: Record<string, RemoteHomeWelcomeCardRecord>, locale: string): Record<string, RemoteHomeWelcomeCardRecord> {
  const localeRecords = Object.entries(records)
    .filter(([, record]) => record.locale === locale)
    .sort((left, right) => right[1].dateKey.localeCompare(left[1].dateKey));

  const allowedKeys = new Set(localeRecords.slice(0, 7).map(([key]) => key));

  return Object.fromEntries(
    Object.entries(records).filter(([key, record]) => record.locale !== locale || allowedKeys.has(key)),
  );
}

export async function prefetchRemoteHomeWelcomeCard(
  dateKey: string,
  locale: string,
  options: RemoteHomeWelcomeCardPrefetchOptions = {},
): Promise<RemoteHomeWelcomeCardRecord | null> {
  const storage = options.storage ?? createUniJsonStorage();
  const config = {
    ...getDeepSeekHomeWelcomeCardConfig(),
    ...options,
  };

  if (!hasUsableDeepSeekConfig(config)) {
    return null;
  }

  const existing = readRemoteHomeWelcomeCard(dateKey, locale, storage);
  if (existing) {
    return existing;
  }

  const requestKey = resolveRemoteCacheKey(dateKey, locale);
  const pending = pendingRemoteCardRequests.get(requestKey);

  if (pending) {
    return pending;
  }

  const nextPromise = Promise.resolve(
    options.context === undefined ? collectRecentDiaryPreludeContext() : options.context ?? null,
  ).then((context) =>
    requestRemoteHomeWelcomeCard(dateKey, locale, {
      ...config,
      context,
      requestFn: options.requestFn ?? (typeof uni !== "undefined" && typeof uni.request === "function" ? uni.request : null),
      now: options.now ?? (() => new Date()),
    }),
  ).then((record) => {
    if (!record) {
      return null;
    }

    const currentRecords = readRemoteCacheMap(storage);
    currentRecords[requestKey] = record;
    writeRemoteCacheMap(storage, pruneRemoteCache(currentRecords, locale));
    return record;
  }).finally(() => {
    pendingRemoteCardRequests.delete(requestKey);
  });

  pendingRemoteCardRequests.set(requestKey, nextPromise);
  return nextPromise;
}
