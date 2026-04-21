import { getArchiveRepository } from "@/app/store/archiveRepository";
import { getEntryRepository } from "@/app/store/entryRepository";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { IEntryRepository } from "@/data/repositories/entry.repository";
import type { ArchiveQuestionProvider } from "@/features/archive/archiveQuestions";
import type { ArchiveEntry } from "@/features/archive/types";
import type { Entry } from "@/domain/entry/types";

const DEFAULT_DEEPSEEK_BASE_URL = "https://api.deepseek.com";
const DEFAULT_DEEPSEEK_MODEL = "deepseek-chat";
const ARCHIVE_REMOTE_QUESTION_TIMEOUT_MS = 5000;

type RequestFn = (options: {
  url: string;
  method: "POST";
  header: Record<string, string>;
  data: unknown;
  timeout: number;
  success: (result: { statusCode: number; data: unknown }) => void;
  fail: (error: unknown) => void;
}) => void;

interface DeepSeekArchiveQuestionConfig {
  apiKey?: string | null;
  baseUrl?: string | null;
  model?: string | null;
}

export interface ArchiveQuestionPromptArchive {
  date: string;
  question: string;
  answer: string;
}

export interface ArchiveQuestionPromptMood {
  date: string;
  moodCode: string | null;
  moodLabelZh: string | null;
  moodLabelEn: string | null;
}

export interface ArchiveQuestionPromptContext {
  recentArchives: ArchiveQuestionPromptArchive[];
  recentDiaryMoods: ArchiveQuestionPromptMood[];
}

export interface DeepSeekArchiveQuestionProviderOptions extends DeepSeekArchiveQuestionConfig {
  archiveRepository?: IArchiveRepository;
  entryRepository?: IEntryRepository;
  requestFn?: RequestFn | null;
}

interface DeepSeekChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function compareEntries(left: Entry, right: Entry): number {
  if (left.recordDate !== right.recordDate) {
    return right.recordDate.localeCompare(left.recordDate);
  }

  return right.createdAt.localeCompare(left.createdAt);
}

function compareArchiveEntries(left: ArchiveEntry, right: ArchiveEntry): number {
  if (left.date !== right.date) {
    return right.date.localeCompare(left.date);
  }

  return right.createdAt.localeCompare(left.createdAt);
}

function getDeepSeekArchiveQuestionConfig(): Required<DeepSeekArchiveQuestionConfig> {
  const env = import.meta.env as ImportMetaEnv | undefined;

  return {
    apiKey: env?.VITE_DEEPSEEK_API_KEY?.trim() ?? "",
    baseUrl: env?.VITE_DEEPSEEK_BASE_URL?.trim() ?? DEFAULT_DEEPSEEK_BASE_URL,
    model: env?.VITE_DEEPSEEK_MODEL?.trim() ?? DEFAULT_DEEPSEEK_MODEL,
  };
}

function resolveRequestFn(requestFn?: RequestFn | null): RequestFn | null {
  if (requestFn) {
    return requestFn;
  }

  return typeof uni !== "undefined" && typeof uni.request === "function" ? uni.request : null;
}

function hasUsableConfig(config: DeepSeekArchiveQuestionConfig): boolean {
  return Boolean(config.apiKey?.trim());
}

function sanitizeQuestion(question: string, recentArchives: ArchiveQuestionPromptArchive[]): string | null {
  const normalized = question.replace(/\s+/gu, " ").trim();

  if (
    normalized.length < 6
    || normalized.length > 80
    || !/[？?]$/u.test(normalized)
    || /```|`[^`]+`|\[[^\]]+\]\([^)]+\)|[*_~#>|]/u.test(normalized)
    || /(AI|模型|大模型|作为|以下|问题是|question)/iu.test(normalized)
  ) {
    return null;
  }

  const recentQuestions = new Set(recentArchives.map((entry) => entry.question.trim()));
  if (recentQuestions.has(normalized)) {
    return null;
  }

  return normalized;
}

function parseDeepSeekQuestionResponse(
  responseData: unknown,
  date: string,
  context: ArchiveQuestionPromptContext,
): ReturnType<ArchiveQuestionProvider["getQuestion"]> extends Promise<infer T> ? T : never {
  const response = responseData as DeepSeekChatCompletionResponse | undefined;
  const content = response?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return null;
  }

  try {
    const parsed = JSON.parse(content) as { question?: unknown };
    const question = typeof parsed.question === "string"
      ? sanitizeQuestion(parsed.question, context.recentArchives)
      : null;

    if (!question) {
      return null;
    }

    return {
      date,
      question,
      source: "remote",
    };
  } catch {
    return null;
  }
}

function buildDeepSeekArchiveQuestionMessages(date: string, context: ArchiveQuestionPromptContext) {
  return [
    {
      role: "system",
      content: [
        "你为一个私密日记 App 生成每日档案馆问题。",
        "只输出严格 JSON，格式必须是 {\"question\":\"...？\"}。",
        "问题必须是一个简体中文问题，6 到 80 个字符，以问号结尾。",
        "不要输出 markdown、编号、解释、寒暄、AI/模型相关措辞。",
        "根据最近 5 条档案馆问答和最近 10 条日记心情，生成一个新的、具体的、温柔但不重复的问题。",
        "不要重复 recentArchives 里的旧问题，不要直接复述用户回答。",
      ].join(" "),
    },
    {
      role: "user",
      content: JSON.stringify({
        date,
        appStyle: "quiet private archive, reflective daily question",
        recentArchives: context.recentArchives,
        recentDiaryMoods: context.recentDiaryMoods,
      }),
    },
  ];
}

async function requestDeepSeekArchiveQuestion(
  date: string,
  context: ArchiveQuestionPromptContext,
  options: Required<Pick<DeepSeekArchiveQuestionProviderOptions, "requestFn">>
    & DeepSeekArchiveQuestionConfig,
) {
  const requestFn = options.requestFn;

  if (!requestFn || !hasUsableConfig(options)) {
    return null;
  }

  return new Promise<Awaited<ReturnType<ArchiveQuestionProvider["getQuestion"]>>>((resolve) => {
    requestFn({
      url: `${(options.baseUrl ?? DEFAULT_DEEPSEEK_BASE_URL).replace(/\/$/u, "")}/chat/completions`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      timeout: ARCHIVE_REMOTE_QUESTION_TIMEOUT_MS,
      data: {
        model: options.model ?? DEFAULT_DEEPSEEK_MODEL,
        response_format: { type: "json_object" },
        temperature: 0.75,
        max_tokens: 120,
        messages: buildDeepSeekArchiveQuestionMessages(date, context),
      },
      success: (result) => {
        if (result.statusCode < 200 || result.statusCode >= 300) {
          resolve(null);
          return;
        }

        resolve(parseDeepSeekQuestionResponse(result.data, date, context));
      },
      fail: () => resolve(null),
    });
  });
}

export async function collectArchiveQuestionPromptContext({
  archiveRepository = getArchiveRepository(),
  entryRepository = getEntryRepository(),
}: {
  archiveRepository?: IArchiveRepository;
  entryRepository?: IEntryRepository;
} = {}): Promise<ArchiveQuestionPromptContext> {
  const [archives, diaries] = await Promise.all([
    archiveRepository.listAnswered(),
    entryRepository.getByType("diary"),
  ]);

  return {
    recentArchives: archives
      .filter((entry) => entry.question.trim() && entry.answer.trim())
      .sort(compareArchiveEntries)
      .slice(0, 5)
      .map((entry) => ({
        date: entry.date,
        question: entry.question,
        answer: entry.answer,
      })),
    recentDiaryMoods: diaries
      .filter((entry) => entry.diaryPrelude?.moodCode)
      .sort(compareEntries)
      .slice(0, 10)
      .map((entry) => ({
        date: entry.recordDate,
        moodCode: entry.diaryPrelude?.moodCode ?? null,
        moodLabelZh: entry.diaryPrelude?.moodLabelZh ?? null,
        moodLabelEn: entry.diaryPrelude?.moodLabelEn ?? null,
      })),
  };
}

export function createDeepSeekArchiveQuestionProvider(
  options: DeepSeekArchiveQuestionProviderOptions = {},
): ArchiveQuestionProvider {
  return {
    async getQuestion(date) {
      const config = {
        ...getDeepSeekArchiveQuestionConfig(),
        ...options,
      };
      const requestFn = resolveRequestFn(options.requestFn);

      if (!requestFn || !hasUsableConfig(config)) {
        return null;
      }

      const context = await collectArchiveQuestionPromptContext({
        archiveRepository: options.archiveRepository,
        entryRepository: options.entryRepository,
      });

      return requestDeepSeekArchiveQuestion(date, context, {
        ...config,
        requestFn,
      });
    },
  };
}
