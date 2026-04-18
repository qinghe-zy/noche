import type { HomeWelcomeCardType } from "@/features/home/homeWelcomeCardCatalog";

export interface HomeWelcomeCardTheme {
  accentToken: "action" | "mood" | "playful" | "quote" | "season";
  chipVariant: "airy" | "light" | "note" | "quiet" | "soft";
  icon: string;
}

const HOME_WELCOME_CARD_THEME_MAP: Record<HomeWelcomeCardType, HomeWelcomeCardTheme> = {
  today_quote: {
    accentToken: "quote",
    chipVariant: "quiet",
    icon: "✦",
  },
  mood_response: {
    accentToken: "mood",
    chipVariant: "soft",
    icon: "◐",
  },
  weather_season: {
    accentToken: "season",
    chipVariant: "airy",
    icon: "≈",
  },
  playful_draw: {
    accentToken: "playful",
    chipVariant: "light",
    icon: "✳",
  },
  action_prompt: {
    accentToken: "action",
    chipVariant: "note",
    icon: "→",
  },
};

export function resolveHomeWelcomeCardTheme(type: HomeWelcomeCardType): HomeWelcomeCardTheme {
  return HOME_WELCOME_CARD_THEME_MAP[type];
}
