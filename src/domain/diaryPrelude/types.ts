export type DiaryPreludeStatus = "unseen" | "selected" | "skipped";

export interface DiaryPreludeMeta {
  weatherCode: string | null;
  weatherLabelZh: string | null;
  weatherLabelEn: string | null;
  moodCode: string | null;
  moodLabelZh: string | null;
  moodLabelEn: string | null;
  quote: string | null;
}

export interface DiaryPreludeOption {
  code: string;
  labelZh: string;
  labelEn: string;
}
