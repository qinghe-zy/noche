import { describe, expect, it, vi } from "vitest";
import {
  createArchiveQuestionResolver,
  hashArchiveDate,
  type ArchiveQuestionProvider,
} from "@/features/archive/archiveQuestions";

describe("archiveQuestions", () => {
  it("uses the remote provider when it returns a question", async () => {
    const provider: ArchiveQuestionProvider = {
      async getQuestion(date) {
        return { date, question: "今天你最想留下什么？", source: "remote" };
      },
    };
    const resolver = createArchiveQuestionResolver(provider);

    await expect(resolver.resolve("2026-04-21")).resolves.toMatchObject({
      date: "2026-04-21",
      question: "今天你最想留下什么？",
      source: "remote",
    });
  });

  it("falls back to the local catalog when the remote provider returns null", async () => {
    const provider: ArchiveQuestionProvider = { getQuestion: vi.fn().mockResolvedValue(null) };
    const resolver = createArchiveQuestionResolver(provider);

    const result = await resolver.resolve("2026-04-21");

    expect(result.date).toBe("2026-04-21");
    expect(result.source).toBe("fallback");
    expect(result.question.length).toBeGreaterThan(0);
  });

  it("keeps the fallback selection stable for the same date", () => {
    expect(hashArchiveDate("2026-04-21")).toBe(hashArchiveDate("2026-04-21"));
  });
});
