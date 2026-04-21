import type { IArchiveRepository } from "@/data/repositories/archive.repository";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";
import { nowIso } from "@/shared/utils/date";
import { createId } from "@/shared/utils/id";
import type { JsonStorage } from "@/shared/utils/storage";

const STORAGE_KEY = "noche.archive.v1";

interface ArchiveState {
  questions: Record<string, ArchiveQuestion>;
  entries: Record<string, ArchiveEntry>;
}

function readState(storage: JsonStorage): ArchiveState {
  const raw = storage.getString(STORAGE_KEY);
  return raw
    ? JSON.parse(raw) as ArchiveState
    : { questions: {}, entries: {} };
}

function writeState(storage: JsonStorage, state: ArchiveState): void {
  storage.setString(STORAGE_KEY, JSON.stringify(state));
}

function resolveOneYearAgoDate(date: string): string {
  return `${String(Number(date.slice(0, 4)) - 1).padStart(4, "0")}${date.slice(4)}`;
}

export function createStorageArchiveRepository(storage: JsonStorage): IArchiveRepository {
  return {
    async saveQuestion(question) {
      const state = readState(storage);
      state.questions[question.date] = question;
      writeState(storage, state);
    },

    async getQuestionByDate(date) {
      return readState(storage).questions[date] ?? null;
    },

    async answerToday(date, answer) {
      const state = readState(storage);
      const question = state.questions[date];

      if (!question) {
        throw new Error(`Missing archive question for ${date}.`);
      }

      const existingEntry = state.entries[date];
      const timestamp = nowIso();
      const nextEntry: ArchiveEntry = {
        id: existingEntry?.id ?? createId(),
        date,
        question: question.question,
        answer,
        questionSource: question.source,
        createdAt: existingEntry?.createdAt ?? timestamp,
        updatedAt: timestamp,
        answeredAt: timestamp,
      };

      state.entries[date] = nextEntry;
      writeState(storage, state);
      return nextEntry;
    },

    async deleteByDate(date) {
      const state = readState(storage);
      delete state.entries[date];
      writeState(storage, state);
    },

    async getByDate(date) {
      return readState(storage).entries[date] ?? null;
    },

    async listAnswered() {
      return Object.values(readState(storage).entries).sort((a, b) => b.date.localeCompare(a.date));
    },

    async getOneYearAgo(date) {
      return readState(storage).entries[resolveOneYearAgoDate(date)] ?? null;
    },
  };
}
