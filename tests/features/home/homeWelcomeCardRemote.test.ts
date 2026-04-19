import { describe, expect, it, vi } from "vitest";
import { createMemoryJsonStorage } from "@/shared/utils/storage";
import {
  createRemoteHomeWelcomeCardId,
  prefetchRemoteHomeWelcomeCard,
  readRemoteHomeWelcomeCard,
} from "@/features/home/homeWelcomeCardRemote";

describe("home welcome card remote", () => {
  it("prefetches, normalizes, and caches a remote DeepSeek card", async () => {
    const storage = createMemoryJsonStorage();
    const result = await prefetchRemoteHomeWelcomeCard("2026-04-19", "zh-CN", {
      apiKey: "test-key",
      storage,
      now: () => new Date("2026-04-19T08:30:00.000Z"),
      requestFn: ({ success }) => {
        success({
          statusCode: 200,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  type: "today_quote",
                  content: "风把今天放轻了一点，适合写下第一句。",
                }),
              },
            }],
          },
        });
      },
    });

    expect(result).toEqual({
      id: createRemoteHomeWelcomeCardId("2026-04-19", "zh-CN"),
      dateKey: "2026-04-19",
      locale: "zh-CN",
      type: "today_quote",
      content: "风把今天放轻了一点，适合写下第一句。",
      generatedAt: "2026-04-19T08:30:00.000Z",
    });
    expect(readRemoteHomeWelcomeCard("2026-04-19", "zh-CN", storage)).toEqual(result);
  });

  it("returns null when the remote request fails so local cards can take over", async () => {
    const storage = createMemoryJsonStorage();
    const result = await prefetchRemoteHomeWelcomeCard("2026-04-19", "zh-CN", {
      apiKey: "test-key",
      storage,
      requestFn: ({ fail }) => fail(new Error("network down")),
    });

    expect(result).toBeNull();
    expect(readRemoteHomeWelcomeCard("2026-04-19", "zh-CN", storage)).toBeNull();
  });

  it("rejects dirty remote payloads with extra keys, markdown, or forbidden copy", async () => {
    const storage = createMemoryJsonStorage();

    for (const content of [
      JSON.stringify({
        type: "today_quote",
        content: "**先写一句轻一点的话。**",
      }),
      JSON.stringify({
        type: "today_quote",
        content: "第3张卡，提醒你先慢一点。",
      }),
      JSON.stringify({
        type: "today_quote",
        content: "把今天折成一小页留给自己。",
        extra: "unexpected",
      }),
    ]) {
      const result = await prefetchRemoteHomeWelcomeCard("2026-04-19", "zh-CN", {
        apiKey: "test-key",
        storage,
        requestFn: ({ success }) => {
          success({
            statusCode: 200,
            data: {
              choices: [{
                message: {
                  content,
                },
              }],
            },
          });
        },
      });

      expect(result).toBeNull();
    }
  });

  it("dedupes concurrent requests for the same date and locale", async () => {
    const storage = createMemoryJsonStorage();
    let capturedSuccess: ((result: { statusCode: number; data: unknown }) => void) | null = null;
    const requestFn = vi.fn(({ success }) => {
      capturedSuccess = success;
    });

    const firstPromise = prefetchRemoteHomeWelcomeCard("2026-04-19", "zh-CN", {
      apiKey: "test-key",
      storage,
      context: null,
      now: () => new Date("2026-04-19T08:30:00.000Z"),
      requestFn,
    });
    const secondPromise = prefetchRemoteHomeWelcomeCard("2026-04-19", "zh-CN", {
      apiKey: "test-key",
      storage,
      context: null,
      now: () => new Date("2026-04-19T08:30:00.000Z"),
      requestFn,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(requestFn).toHaveBeenCalledTimes(1);

    capturedSuccess?.({
      statusCode: 200,
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              type: "weather_season",
              content: "云层低一些的时候，字句也会更靠近心里。",
            }),
          },
        }],
      },
    });

    const [first, second] = await Promise.all([firstPromise, secondPromise]);

    expect(first).toEqual(second);
  });

  it("includes recent diary prelude context in the DeepSeek prompt payload when available", async () => {
    const storage = createMemoryJsonStorage();
    let payload: any = null;

    await prefetchRemoteHomeWelcomeCard("2026-04-20", "zh-CN", {
      apiKey: "test-key",
      storage,
      now: () => new Date("2026-04-19T08:30:00.000Z"),
      context: {
        sampleCount: 4,
        latestWeatherCode: "rainy",
        latestMoodCode: "anxious",
        dominantWeatherCode: "cloudy",
        dominantMoodCode: "calm",
      },
      requestFn: ({ data, success }) => {
        payload = data;
        success({
          statusCode: 200,
          data: {
            choices: [{
              message: {
                content: JSON.stringify({
                  type: "mood_response",
                  content: "今天适合先把心里的潮气慢慢写开。",
                }),
              },
            }],
          },
        });
      },
    });

    const userMessage = payload?.messages?.[1]?.content;

    expect(typeof userMessage).toBe("string");
    expect(userMessage).toContain("\"latestWeatherCode\":\"rainy\"");
    expect(userMessage).toContain("\"dominantMoodCode\":\"calm\"");
  });
});
