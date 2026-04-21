import type { SQLiteClient } from "@/data/db/sqlite";
import { TABLES } from "@/data/db/schema";
import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";

interface ArchiveQuestionRecord {
  date: string;
  question: string;
  source: ArchiveQuestion["source"];
  createdAt: string;
}

interface ArchiveEntryRecord {
  id: string;
  date: string;
  question: string;
  answer: string;
  questionSource: ArchiveEntry["questionSource"];
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
}

function resolveOneYearAgoDate(date: string): string {
  return `${String(Number(date.slice(0, 4)) - 1).padStart(4, "0")}${date.slice(4)}`;
}

export function createSQLiteArchiveRepository(client: SQLiteClient): IArchiveRepository {
  return {
    async saveQuestion(question) {
      await client.execute(
        `INSERT INTO ${TABLES.archiveQuestions} (
          date,
          question,
          source,
          created_at
        ) VALUES (?, ?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          question = excluded.question,
          source = excluded.source,
          created_at = excluded.created_at`,
        [question.date, question.question, question.source, question.createdAt],
      );
    },

    async getQuestionByDate(date) {
      const rows = await client.query<ArchiveQuestionRecord>(
        `SELECT
          date,
          question,
          source,
          created_at as createdAt
         FROM ${TABLES.archiveQuestions}
         WHERE date = ?
         LIMIT 1`,
        [date],
      );

      return rows[0] ?? null;
    },

    async answerToday(date, answer) {
      const question = await this.getQuestionByDate(date);

      if (!question) {
        throw new Error(`Missing archive question for ${date}.`);
      }

      const now = nowIso();
      const entry: ArchiveEntry = {
        id: createId(),
        date,
        question: question.question,
        answer,
        questionSource: question.source,
        createdAt: now,
        updatedAt: now,
        answeredAt: now,
      };

      await client.execute(
        `INSERT OR REPLACE INTO ${TABLES.archiveEntries} (
          date,
          id,
          question,
          answer,
          question_source,
          created_at,
          updated_at,
          answered_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.date,
          entry.id,
          entry.question,
          entry.answer,
          entry.questionSource,
          entry.createdAt,
          entry.updatedAt,
          entry.answeredAt,
        ],
      );

      return entry;
    },

    async deleteByDate(date) {
      await client.execute(
        `DELETE FROM ${TABLES.archiveEntries}
         WHERE date = ?`,
        [date],
      );
    },

    async getByDate(date) {
      const rows = await client.query<ArchiveEntryRecord>(
        `SELECT
          id,
          date,
          question,
          answer,
          question_source as questionSource,
          created_at as createdAt,
          updated_at as updatedAt,
          answered_at as answeredAt
         FROM ${TABLES.archiveEntries}
         WHERE date = ?
         LIMIT 1`,
        [date],
      );

      return rows[0] ?? null;
    },

    async listAnswered() {
      return client.query<ArchiveEntryRecord>(
        `SELECT
          id,
          date,
          question,
          answer,
          question_source as questionSource,
          created_at as createdAt,
          updated_at as updatedAt,
          answered_at as answeredAt
         FROM ${TABLES.archiveEntries}
         ORDER BY date DESC`,
      );
    },

    async getOneYearAgo(date) {
      return this.getByDate(resolveOneYearAgoDate(date));
    },
  };
}
