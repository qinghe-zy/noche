import type { IEntryRepository } from "@/data/repositories/entry.repository";
import { getEntryRepository } from "@/app/store/entryRepository";
import type { Entry } from "@/domain/entry/types";

export interface RemoteHomeWelcomeCardPromptContext {
  sampleCount: number;
  latestWeatherCode: string | null;
  latestMoodCode: string | null;
  dominantWeatherCode: string | null;
  dominantMoodCode: string | null;
}

function compareEntries(left: Entry, right: Entry): number {
  if (left.recordDate !== right.recordDate) {
    return right.recordDate.localeCompare(left.recordDate);
  }

  return right.createdAt.localeCompare(left.createdAt);
}

function pickDominantCode(codes: Array<string | null>): string | null {
  const counts = new Map<string, number>();
  const firstSeenIndex = new Map<string, number>();

  codes.forEach((code, index) => {
    if (!code) {
      return;
    }

    counts.set(code, (counts.get(code) ?? 0) + 1);
    if (!firstSeenIndex.has(code)) {
      firstSeenIndex.set(code, index);
    }
  });

  const rankedCodes = [...counts.entries()].sort((left, right) => {
    if (left[1] !== right[1]) {
      return right[1] - left[1];
    }

    return (firstSeenIndex.get(left[0]) ?? Number.MAX_SAFE_INTEGER)
      - (firstSeenIndex.get(right[0]) ?? Number.MAX_SAFE_INTEGER);
  });

  return rankedCodes[0]?.[0] ?? null;
}

export async function collectRecentDiaryPreludeContext(
  entryRepository: IEntryRepository = getEntryRepository(),
): Promise<RemoteHomeWelcomeCardPromptContext | null> {
  const diaries = (await entryRepository.getByType("diary"))
    .filter((entry) => entry.diaryPrelude && (entry.diaryPrelude.weatherCode || entry.diaryPrelude.moodCode))
    .sort(compareEntries)
    .slice(0, 12);

  if (diaries.length === 0) {
    return null;
  }

  const latestPrelude = diaries[0]?.diaryPrelude ?? null;
  const weatherCodes = diaries.map((entry) => entry.diaryPrelude?.weatherCode ?? null);
  const moodCodes = diaries.map((entry) => entry.diaryPrelude?.moodCode ?? null);

  return {
    sampleCount: diaries.length,
    latestWeatherCode: latestPrelude?.weatherCode ?? null,
    latestMoodCode: latestPrelude?.moodCode ?? null,
    dominantWeatherCode: pickDominantCode(weatherCodes),
    dominantMoodCode: pickDominantCode(moodCodes),
  };
}
