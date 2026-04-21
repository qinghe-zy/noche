import { describe, expect, it } from "vitest";
import { createSQLiteArchiveRepository } from "@/data/repositories/sqliteArchiveRepository";
import { FakeSQLiteClient } from "./fakeSQLiteClient";

describe("sqliteArchiveRepository", () => {
  it("creates and reads archive rows after saveQuestion", async () => {
    const client = new FakeSQLiteClient();
    client.queryResults.push([
      {
        date: "2026-04-21",
        question: "你想把什么交给一年后的自己？",
        source: "remote",
        createdAt: "2026-04-21T08:00:00.000Z",
      },
    ]);
    const repository = createSQLiteArchiveRepository(client);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "你想把什么交给一年后的自己？",
      source: "remote",
      createdAt: "2026-04-21T08:00:00.000Z",
    });

    expect(await repository.getQuestionByDate("2026-04-21")).toMatchObject({
      date: "2026-04-21",
      source: "remote",
    });
    expect(client.executed[0]?.sql).toContain("archive_questions");
  });

  it("writes an answered archive entry", async () => {
    const client = new FakeSQLiteClient();
    client.queryResults.push([
      {
        date: "2026-04-21",
        question: "今天你最想留下什么？",
        source: "fallback",
        createdAt: "2026-04-21T08:00:00.000Z",
      },
    ]);
    const repository = createSQLiteArchiveRepository(client);

    await repository.answerToday("2026-04-21", "我想留下今天的平静。");

    expect(client.executed).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sql: expect.stringContaining("archive_entries"),
      }),
    ]));
  });
});
