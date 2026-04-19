import { describe, expect, it } from "vitest";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import {
  HOME_WELCOME_CARD_COLLECTION_STORAGE_KEY,
  HOME_WELCOME_CARD_HISTORY_STORAGE_KEY,
  HOME_WELCOME_CARD_STORAGE_KEY,
  isHomeWelcomeCardCollected,
  markHomeWelcomeCardCollected,
  markHomeWelcomeCardResolved,
  removeHomeWelcomeCardCollected,
  markHomeWelcomeCardSeen,
  readHomeWelcomeCardCollection,
  readHomeWelcomeCardCollectionCount,
  readHomeWelcomeCardHistory,
  readHomeWelcomeCardSeenDate,
  readHomeWelcomeCards,
  resolveCollectedHomeWelcomeCard,
  isHomeWelcomeCardAvailableOnDate,
  resolveHomeWelcomeCard,
  resolveHomeWelcomeCardEyebrow,
  resolveHomeWelcomeCardGlyph,
  resolveHomeWelcomeCardTheme,
  shouldAutoShowHomeWelcomeCard,
} from "@/features/home/homeWelcomeCard";
import {
  HOME_WELCOME_CARD_REMOTE_CACHE_KEY,
  createRemoteHomeWelcomeCardId,
} from "@/features/home/homeWelcomeCardRemote";

describe("home welcome card", () => {
  it("loads the full doc-backed card pool with metadata instead of the old sample subset", () => {
    const cards = readHomeWelcomeCards();
    const typeCounts = cards.reduce<Record<string, number>>((counts, card) => {
      counts[card.type] = (counts[card.type] ?? 0) + 1;
      return counts;
    }, {});
    const firstCard = cards.find((card) => card.id === "card_001");

    expect(cards).toHaveLength(300);
    expect(typeCounts).toEqual({
      today_quote: 93,
      mood_response: 77,
      weather_season: 52,
      action_prompt: 48,
      playful_draw: 30,
    });
    expect(firstCard).toMatchObject({
      id: "card_001",
      type: "today_quote",
      timeTag: "morning",
      weatherTag: "none",
      moodTag: "none",
      triggerMode: "random",
      cooldownDays: 30,
      isActive: true,
      solarTerms: [],
    });
    expect(firstCard?.content).not.toContain("第 ");
    expect(firstCard?.content).not.toContain("张摘句卡");
  });

  it("returns a stable daily card for the same date", () => {
    expect(resolveHomeWelcomeCard("2026-04-16")).toEqual(resolveHomeWelcomeCard("2026-04-16"));
  });

  it("keeps collected cards permanently excluded from future daily picks", () => {
    const storage = createMemoryJsonStorage();

    markHomeWelcomeCardCollected("2026-04-14", "card_001", storage, "2026-04-14T07:30:00.000Z");

    const result = resolveHomeWelcomeCard("2026-04-16", { storage });

    expect(result.id).not.toBe("card_001");
    expect(isHomeWelcomeCardCollected("2026-12-31", "card_001", storage)).toBe(true);
  });

  it("avoids showing the same type three days in a row when prior history already hit the limit", () => {
    const storage = createMemoryJsonStorage();

    markHomeWelcomeCardResolved("2026-04-14", "card_001", storage, "2026-04-14T08:00:00.000Z");
    markHomeWelcomeCardResolved("2026-04-15", "card_002", storage, "2026-04-15T08:00:00.000Z");

    const result = resolveHomeWelcomeCard("2026-04-16", { storage });

    expect(result.type).not.toBe("today_quote");
  });

  it("respects card cooldown windows when prior display history already used the same card recently", () => {
    const storage = createMemoryJsonStorage();

    markHomeWelcomeCardResolved("2026-04-10", "card_014", storage, "2026-04-10T08:00:00.000Z");

    const result = resolveHomeWelcomeCard("2026-04-16", { storage });

    expect(result.id).not.toBe("card_014");
  });

  it("only allows solar-term weather cards on their matching solar-term dates", () => {
    const springEquinoxCard = readHomeWelcomeCards().find((card) => card.id === "card_023");
    const pairedSolarTermCard = readHomeWelcomeCards().find((card) => card.content.includes("小雪与大雪"));
    const regularWeatherCard = readHomeWelcomeCards().find((card) => card.id === "card_024");

    expect(springEquinoxCard?.solarTerms).toEqual(["春分"]);
    expect(isHomeWelcomeCardAvailableOnDate(springEquinoxCard!, "2026-03-20")).toBe(true);
    expect(isHomeWelcomeCardAvailableOnDate(springEquinoxCard!, "2026-03-19")).toBe(false);

    expect(pairedSolarTermCard?.solarTerms).toEqual(["小雪", "大雪"]);
    expect(isHomeWelcomeCardAvailableOnDate(pairedSolarTermCard!, "2026-11-22")).toBe(true);
    expect(isHomeWelcomeCardAvailableOnDate(pairedSolarTermCard!, "2026-12-07")).toBe(true);
    expect(isHomeWelcomeCardAvailableOnDate(pairedSolarTermCard!, "2026-11-25")).toBe(false);

    expect(regularWeatherCard?.solarTerms).toEqual([]);
    expect(isHomeWelcomeCardAvailableOnDate(regularWeatherCard!, "2026-03-19")).toBe(true);
  });

  it("resolves localized eyebrow copy from card type", () => {
    expect(resolveHomeWelcomeCardEyebrow("today_quote", "zh-CN")).toBe("今日摘句");
    expect(resolveHomeWelcomeCardEyebrow("mood_response", "zh-CN")).toBe("情绪辑录");
    expect(resolveHomeWelcomeCardEyebrow("weather_season", "en-US")).toBe("SEASON FRAME");
    expect(resolveHomeWelcomeCardEyebrow("playful_draw", "zh-CN")).toBe("今日抽签");
    expect(resolveHomeWelcomeCardEyebrow("action_prompt", "en-US")).toBe("ACTION NOTE");
  });

  it("resolves a lightweight symbol marker from card type", () => {
    expect(resolveHomeWelcomeCardGlyph("today_quote")).toBe("✦");
    expect(resolveHomeWelcomeCardGlyph("mood_response")).toBe("◐");
    expect(resolveHomeWelcomeCardGlyph("weather_season")).toBe("≈");
    expect(resolveHomeWelcomeCardGlyph("playful_draw")).toBe("✳");
    expect(resolveHomeWelcomeCardGlyph("action_prompt")).toBe("→");
  });

  it("returns a distinct visual theme mapping for each top-level card type", () => {
    expect(resolveHomeWelcomeCardTheme("today_quote")).toMatchObject({
      accentToken: "quote",
      chipVariant: "quiet",
      icon: "✦",
    });
    expect(resolveHomeWelcomeCardTheme("mood_response")).toMatchObject({
      accentToken: "mood",
      chipVariant: "soft",
      icon: "◐",
    });
    expect(resolveHomeWelcomeCardTheme("weather_season")).toMatchObject({
      accentToken: "season",
      chipVariant: "airy",
      icon: "≈",
    });
    expect(resolveHomeWelcomeCardTheme("playful_draw")).toMatchObject({
      accentToken: "playful",
      chipVariant: "light",
      icon: "✳",
    });
    expect(resolveHomeWelcomeCardTheme("action_prompt")).toMatchObject({
      accentToken: "action",
      chipVariant: "note",
      icon: "→",
    });
  });

  it("only auto-shows the welcome card the first time for a given day", () => {
    expect(shouldAutoShowHomeWelcomeCard("2026-04-16", null)).toBe(true);
    expect(shouldAutoShowHomeWelcomeCard("2026-04-16", "2026-04-15")).toBe(true);
    expect(shouldAutoShowHomeWelcomeCard("2026-04-16", "2026-04-16")).toBe(false);
  });

  it("persists the seen date with local-first storage", () => {
    const storage = createMemoryJsonStorage();

    expect(readHomeWelcomeCardSeenDate(storage)).toBeNull();

    markHomeWelcomeCardSeen("2026-04-16", storage);

    expect(readHomeWelcomeCardSeenDate(storage)).toBe("2026-04-16");
    expect(storage.getString(HOME_WELCOME_CARD_STORAGE_KEY)).toBe("2026-04-16");
  });

  it("stores collected cards as sortable showcase records instead of a date-only lookup", () => {
    const storage = createMemoryJsonStorage();

    expect(readHomeWelcomeCardCollectionCount(storage)).toBe(0);

    markHomeWelcomeCardCollected("2026-04-16", "card_001", storage, "2026-04-16T08:00:00.000Z");
    markHomeWelcomeCardCollected("2026-04-17", "card_014", storage, "2026-04-17T09:15:00.000Z");

    const collection = readHomeWelcomeCardCollection(storage);

    expect(collection).toHaveLength(2);
    expect(collection[0]).toMatchObject({
      cardId: "card_014",
      collectedDateKey: "2026-04-17",
      type: "mood_response",
    });
    expect(collection[1]).toMatchObject({
      cardId: "card_001",
      collectedDateKey: "2026-04-16",
      type: "today_quote",
    });
    expect(readHomeWelcomeCardCollectionCount(storage)).toBe(2);
    expect(storage.getString(HOME_WELCOME_CARD_COLLECTION_STORAGE_KEY)).toContain("card_014");
  });

  it("removes a collected card by card id without touching other showcase records", () => {
    const storage = createMemoryJsonStorage();

    markHomeWelcomeCardCollected("2026-04-16", "card_001", storage, "2026-04-16T08:00:00.000Z");
    markHomeWelcomeCardCollected("2026-04-17", "card_014", storage, "2026-04-17T09:15:00.000Z");

    removeHomeWelcomeCardCollected("card_001", storage);

    expect(readHomeWelcomeCardCollection(storage)).toEqual([
      {
        cardId: "card_014",
        collectedAt: "2026-04-17T09:15:00.000Z",
        collectedDateKey: "2026-04-17",
        type: "mood_response",
      },
    ]);
    expect(readHomeWelcomeCardCollectionCount(storage)).toBe(1);
    expect(isHomeWelcomeCardCollected("2026-12-31", "card_001", storage)).toBe(false);
  });

  it("stores display history as structured records that later rules can read back", () => {
    const storage = createMemoryJsonStorage();

    markHomeWelcomeCardResolved("2026-04-16", "card_001", storage, "2026-04-16T08:00:00.000Z");
    markHomeWelcomeCardResolved("2026-04-17", "card_014", storage, "2026-04-17T08:00:00.000Z");

    expect(readHomeWelcomeCardHistory(storage)).toEqual([
      {
        cardId: "card_014",
        dateKey: "2026-04-17",
        resolvedAt: "2026-04-17T08:00:00.000Z",
        type: "mood_response",
      },
      {
        cardId: "card_001",
        dateKey: "2026-04-16",
        resolvedAt: "2026-04-16T08:00:00.000Z",
        type: "today_quote",
      },
    ]);
    expect(storage.getString(HOME_WELCOME_CARD_HISTORY_STORAGE_KEY)).toContain("card_014");
  });

  it("stores remote cards as showcase snapshots so they still render without the local catalog", () => {
    const storage = createMemoryJsonStorage({
      [HOME_WELCOME_CARD_REMOTE_CACHE_KEY]: JSON.stringify({
        "zh-CN:2026-04-19": {
          id: createRemoteHomeWelcomeCardId("2026-04-19", "zh-CN"),
          dateKey: "2026-04-19",
          locale: "zh-CN",
          type: "weather_season",
          content: "雨线落慢一点的时候，句子也会自己靠近。",
          generatedAt: "2026-04-19T08:30:00.000Z",
        },
      }),
    });
    const remoteCardId = createRemoteHomeWelcomeCardId("2026-04-19", "zh-CN");

    markHomeWelcomeCardCollected("2026-04-19", remoteCardId, storage, "2026-04-19T08:31:00.000Z");

    const collection = readHomeWelcomeCardCollection(storage);

    expect(collection).toEqual([
      {
        cardId: remoteCardId,
        collectedAt: "2026-04-19T08:31:00.000Z",
        collectedDateKey: "2026-04-19",
        type: "weather_season",
        source: "remote",
        contentSnapshot: "雨线落慢一点的时候，句子也会自己靠近。",
        generatedAt: "2026-04-19T08:30:00.000Z",
        locale: "zh-CN",
      },
    ]);
    expect(resolveCollectedHomeWelcomeCard(collection[0], storage)).toMatchObject({
      id: remoteCardId,
      type: "weather_season",
      content: "雨线落慢一点的时候，句子也会自己靠近。",
    });
  });
});
