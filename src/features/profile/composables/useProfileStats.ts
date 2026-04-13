import { ref } from "vue";
import { getEntryRepository } from "@/app/store/entryRepository";
import type { ProfileStats } from "@/features/profile/profileData";

const EMPTY_STATS: ProfileStats = {
  recordedDays: 0,
  totalWords: 0,
  diaryCount: 0,
};

export function useProfileStats() {
  const stats = ref<ProfileStats>({ ...EMPTY_STATS });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function refresh(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      stats.value = await getEntryRepository().getProfileStats();
    } catch (nextError) {
      error.value = nextError instanceof Error ? nextError.message : "加载统计失败。";
      stats.value = { ...EMPTY_STATS };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
}
