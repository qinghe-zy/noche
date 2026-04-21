import { describe, expect, it } from "vitest";
import { buildDiaryPreludeMeta } from "@/domain/diaryPrelude/catalog";
import type { Entry } from "@/domain/entry/types";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import { createMemoryEntryRepository } from "@/data/repositories/memoryEntryRepository";
import {
  collectArchiveQuestionPromptContext,
  createDeepSeekArchiveQuestionProvider,
} from "@/features/archive/archiveRemoteQuestionProvider";
import type { ArchiveEntry } from "@/features/archive/types";

function makeArchiveEntry(overrides: Partial<ArchiveEntry> = {}): ArchiveEntry {
  return {
    id: overrides.id ?? "archive-1",
    date: overrides.date ?? "2026-04-20",
    question: overrides.question ?? "今天你最想留下什么？",
    answer: overrides.answer ?? "想留下平静。",
    questionSource: overrides.questionSource ?? "fallback",
    createdAt: overrides.createdAt ?? "2026-04-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-20T08:10:00.000Z",
    answeredAt: overrides.answeredAt ?? "2026-04-20T08:10:00.000Z",
  };
}

function makeDiary(overrides: Partial<Entry> = {}): Entry {
  return {
    id: overrides.id ?? "diary-1",
    type: "diary",
    status: "saved",
    title: overrides.title ?? null,
    content: overrides.content ?? "今天写了一点。",
    recordDate: overrides.recordDate ?? "2026-04-20",
    createdAt: overrides.createdAt ?? "2026-04-20T08:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-04-20T08:00:00.000Z",
    savedAt: overrides.savedAt ?? "2026-04-20T08:00:00.000Z",
    unlockDate: null,
    unlockedAt: null,
    destroyedAt: null,
    attachments: [],
    diaryPreludeStatus: overrides.diaryPreludeStatus ?? "selected",
    diaryPrelude: "diaryPrelude" in overrides
      ? (overrides.diaryPrelude ?? null)
      : buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: "calm",
        }),
  };
}

function createArchiveRepository(entries: ArchiveEntry[]): IArchiveRepository {
  return {
    saveQuestion: async () => undefined,
    getQuestionByDate: async () => null,
    answerToday: async () => entries[0]!,
    deleteByDate: async () => undefined,
    getByDate: async () => null,
    listAnswered: async () => entries,
    getOneYearAgo: async () => null,
  };
}

describe("archive remote question provider", () => {
  it("collects five recent archive answers and ten recent diary mood records for the prompt", async () => {
    const archiveRepository = createArchiveRepository(
      Array.from({ length: 7 }, (_, index) => makeArchiveEntry({
        id: `archive-${index}`,
        date: `2026-04-${String(20 - index).padStart(2, "0")}`,
        question: `旧问题${index}`,
        answer: `旧回答${index}`,
      })),
    );
    const entryRepository = createMemoryEntryRepository(
      Array.from({ length: 12 }, (_, index) => makeDiary({
        id: `diary-${index}`,
        recordDate: `2026-04-${String(20 - index).padStart(2, "0")}`,
        createdAt: `2026-04-${String(20 - index).padStart(2, "0")}T08:00:00.000Z`,
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "cloudy",
          moodCode: index % 2 === 0 ? "calm" : "anxious",
        }),
      })),
    );

    const context = await collectArchiveQuestionPromptContext({
      archiveRepository,
      entryRepository,
    });

    expect(context.recentArchives).toHaveLength(5);
    expect(context.recentArchives[0]).toMatchObject({
      date: "2026-04-20",
      question: "旧问题0",
      answer: "旧回答0",
    });
    expect(context.recentDiaryMoods).toHaveLength(10);
    expect(context.recentDiaryMoods[0]).toMatchObject({
      date: "2026-04-20",
      moodCode: "calm",
    });
  });

  it("requests a strict JSON archive question from DeepSeek using the collected context", async () => {
    const archiveRepository = createArchiveRepository([
      makeArchiveEntry({ date: "2026-04-20", question: "旧问题", answer: "旧回答" }),
    ]);
    const entryRepository = createMemoryEntryRepository([
      makeDiary({
        recordDate: "2026-04-20",
        diaryPrelude: buildDiaryPreludeMeta({
          weatherCode: "rainy",
          moodCode: "anxious",
        }),
      }),
    ]);
    let payload: any = null;

    const provider = createDeepSeekArchiveQuestionProvider({
      apiKey: "test-key",
      archiveRepository,
      entryRepository,
      requestFn: ({ data, success }) => {
        payload = data;
        success({
          statusCode: 200,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  question: "今天有什么情绪，值得被温柔地追问一次？",
                }),
              },
            }],
          },
        });
      },
    });

    const result = await provider.getQuestion("2026-04-21");

    expect(result).toEqual({
      date: "2026-04-21",
      question: "今天有什么情绪，值得被温柔地追问一次？",
      source: "remote",
    });
    expect(payload.model).toBe("deepseek-chat");
    expect(payload.response_format).toEqual({ type: "json_object" });
    expect(payload.messages[1].content).toContain("\"recentArchives\"");
    expect(payload.messages[1].content).toContain("\"recentDiaryMoods\"");
    expect(payload.messages[1].content).toContain("\"旧问题\"");
    expect(payload.messages[1].content).toContain("\"anxious\"");
  });

  it("returns null when the remote request fails or returns an unusable question", async () => {
    const failedProvider = createDeepSeekArchiveQuestionProvider({
      apiKey: "test-key",
      archiveRepository: createArchiveRepository([]),
      entryRepository: createMemoryEntryRepository(),
      requestFn: ({ fail }) => fail(new Error("network down")),
    });
    const dirtyProvider = createDeepSeekArchiveQuestionProvider({
      apiKey: "test-key",
      archiveRepository: createArchiveRepository([]),
      entryRepository: createMemoryEntryRepository(),
      requestFn: ({ success }) => {
        success({
          statusCode: 200,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  question: "**今天的问题**",
                }),
              },
            }],
          },
        });
      },
    });

    expect(await failedProvider.getQuestion("2026-04-21")).toBeNull();
    expect(await dirtyProvider.getQuestion("2026-04-21")).toBeNull();
  });
});
