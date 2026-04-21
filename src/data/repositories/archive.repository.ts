import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";

export interface IArchiveRepository {
  saveQuestion(question: ArchiveQuestion): Promise<void>;
  getQuestionByDate(date: string): Promise<ArchiveQuestion | null>;
  answerToday(date: string, answer: string): Promise<ArchiveEntry>;
  getByDate(date: string): Promise<ArchiveEntry | null>;
  listAnswered(): Promise<ArchiveEntry[]>;
  getOneYearAgo(date: string): Promise<ArchiveEntry | null>;
}
