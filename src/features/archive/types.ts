export type ArchiveQuestionSource = "remote" | "fallback";

export interface ArchiveQuestion {
  date: string;
  question: string;
  source: ArchiveQuestionSource;
  createdAt: string;
}

export interface ArchiveEntry {
  id: string;
  date: string;
  question: string;
  answer: string;
  questionSource: ArchiveQuestionSource;
  createdAt: string;
  updatedAt: string;
  answeredAt: string | null;
}
