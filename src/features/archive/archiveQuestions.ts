import { ARCHIVE_FALLBACK_QUESTIONS } from "@/features/archive/archiveFallbackCatalog";
import type { ArchiveQuestion } from "@/features/archive/types";
import { nowIso } from "@/shared/utils/date";

export interface ArchiveQuestionProvider {
  getQuestion(date: string): Promise<Pick<ArchiveQuestion, "date" | "question" | "source"> | null>;
}

export function hashArchiveDate(date: string): number {
  return date.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function getFallbackQuestion(date: string): ArchiveQuestion {
  const index = hashArchiveDate(date) % ARCHIVE_FALLBACK_QUESTIONS.length;

  return {
    date,
    question: ARCHIVE_FALLBACK_QUESTIONS[index] ?? ARCHIVE_FALLBACK_QUESTIONS[0],
    source: "fallback",
    createdAt: nowIso(),
  };
}

export function createArchiveQuestionResolver(provider: ArchiveQuestionProvider) {
  return {
    async resolve(date: string): Promise<ArchiveQuestion> {
      const remoteQuestion = await provider.getQuestion(date);

      if (remoteQuestion?.question?.trim()) {
        return {
          date,
          question: remoteQuestion.question.trim(),
          source: remoteQuestion.source,
          createdAt: nowIso(),
        };
      }

      return getFallbackQuestion(date);
    },
  };
}
