import { defineStore } from "pinia";
import { getArchiveRepository } from "@/app/store/archiveRepository";
import {
  createArchiveQuestionResolver,
  type ArchiveQuestionProvider,
} from "@/features/archive/archiveQuestions";
import type { ArchiveEntry, ArchiveQuestion } from "@/features/archive/types";

const fallbackProvider: ArchiveQuestionProvider = {
  async getQuestion() {
    return null;
  },
};

export const useArchiveStore = defineStore("archive", {
  state: () => ({
    todayDate: "",
    todayQuestion: null as ArchiveQuestion | null,
    todayEntry: null as ArchiveEntry | null,
    history: [] as ArchiveEntry[],
    oneYearAgoEntry: null as ArchiveEntry | null,
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    hasAnsweredToday(state): boolean {
      return Boolean(state.todayEntry?.answeredAt);
    },
  },
  actions: {
    async resolveTodayQuestion(date: string): Promise<void> {
      this.isLoading = true;
      this.error = null;
      this.todayDate = date;

      try {
        const repository = getArchiveRepository();
        const existingEntry = await repository.getByDate(date);
        this.todayEntry = existingEntry;

        if (existingEntry) {
          this.todayQuestion = {
            date,
            question: existingEntry.question,
            source: existingEntry.questionSource,
            createdAt: existingEntry.createdAt,
          };
        } else {
          const existingQuestion = await repository.getQuestionByDate(date);
          if (existingQuestion) {
            this.todayQuestion = existingQuestion;
          } else {
            const resolver = createArchiveQuestionResolver(fallbackProvider);
            const nextQuestion = await resolver.resolve(date);
            await repository.saveQuestion(nextQuestion);
            this.todayQuestion = nextQuestion;
          }
        }

        this.history = await repository.listAnswered();
        this.oneYearAgoEntry = await repository.getOneYearAgo(date);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to resolve archive question.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async answerToday(answer: string): Promise<void> {
      if (!this.todayDate) {
        throw new Error("Missing archive date.");
      }

      this.isLoading = true;
      this.error = null;

      try {
        this.todayEntry = await getArchiveRepository().answerToday(this.todayDate, answer);
        this.history = await getArchiveRepository().listAnswered();
        this.oneYearAgoEntry = await getArchiveRepository().getOneYearAgo(this.todayDate);
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Failed to answer archive question.";
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
