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

  it("upserts archive questions so a test refresh can replace today's card", async () => {
    const client = new FakeSQLiteClient();
    const repository = createSQLiteArchiveRepository(client);

    await repository.saveQuestion({
      date: "2026-04-21",
      question: "第二张测试问题？",
      source: "remote",
      createdAt: "2026-04-21T08:01:00.000Z",
    });

    expect(client.executed[0]?.sql).toContain("INSERT INTO");
    expect(client.executed[0]?.sql).toContain("ON CONFLICT(date) DO UPDATE");
  });

  it("deletes an answered archive entry by date", async () => {
    const client = new FakeSQLiteClient();
    const repository = createSQLiteArchiveRepository(client);

    await repository.deleteByDate("2026-04-21");

    expect(client.executed[0]).toEqual(expect.objectContaining({
      sql: expect.stringContaining("DELETE FROM archive_entries"),
      params: ["2026-04-21"],
    }));
  });
});
