import { describe, expect, it } from "vitest";
import { createStorageArchiveRepository } from "@/data/repositories/storageArchiveRepository";
import { createMemoryJsonStorage } from "@/shared/utils/storage";

describe("storageArchiveRepository", () => {
  it("persists a resolved question and an answer", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageArchiveRepository(storage);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      source: "fallback",
      createdAt: "2026-04-21T08:00:00.000Z",
    });
    await repository.answerToday("2026-04-21", "我想留下今天的平静。");

    const entry = await repository.getByDate("2026-04-21");
    expect(entry).toMatchObject({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      answer: "我想留下今天的平静。",
    });
  });

  it("returns the same month/day entry from one year ago", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageArchiveRepository(storage);

    await repository.saveQuestion({
      date: "2025-04-21",
      question: "去年今天你在想什么？",
      source: "fallback",
      createdAt: "2025-04-21T08:00:00.000Z",
    });
    await repository.answerToday("2025-04-21", "在想新的开始。");

    const oneYearAgo = await repository.getOneYearAgo("2026-04-21");
    expect(oneYearAgo?.date).toBe("2025-04-21");
  });

  it("allows a later resolved daily question to replace the previous card during testing", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageArchiveRepository(storage);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "第一张测试问题？",
      source: "fallback",
      createdAt: "2026-04-21T08:00:00.000Z",
    });
    await repository.saveQuestion({
      date: "2026-04-21",
      question: "第二张测试问题？",
      source: "remote",
      createdAt: "2026-04-21T08:01:00.000Z",
    });

    expect(await repository.getQuestionByDate("2026-04-21")).toMatchObject({
      question: "第二张测试问题？",
      source: "remote",
    });
  });

  it("deletes an answered archive entry without removing the cached question", async () => {
    const storage = createMemoryJsonStorage();
    const repository = createStorageArchiveRepository(storage);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "今天想保存什么？",
      source: "fallback",
      createdAt: "2026-04-21T08:00:00.000Z",
    });
    await repository.answerToday("2026-04-21", "保存一个下午。");

    await repository.deleteByDate("2026-04-21");

    expect(await repository.getByDate("2026-04-21")).toBeNull();
    expect(await repository.getQuestionByDate("2026-04-21")).toMatchObject({
      question: "今天想保存什么？",
    });
  });
});
