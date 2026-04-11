import { describe, expect, it, vi } from "vitest";
import { navigateBackOrFallback } from "@/shared/utils/navigation";

describe("navigateBackOrFallback", () => {
  it("navigates back when there is page stack to preserve the user path", () => {
    const navigateBack = vi.fn();
    const reLaunch = vi.fn();

    navigateBackOrFallback({
      canNavigateBack: true,
      fallbackUrl: "/features/home/pages/HomePage",
      navigateBack,
      reLaunch,
    });

    expect(navigateBack).toHaveBeenCalledWith({ delta: 1 });
    expect(reLaunch).not.toHaveBeenCalled();
  });

  it("falls back to a route when there is no page stack", () => {
    const navigateBack = vi.fn();
    const reLaunch = vi.fn();

    navigateBackOrFallback({
      canNavigateBack: false,
      fallbackUrl: "/features/home/pages/HomePage",
      navigateBack,
      reLaunch,
    });

    expect(reLaunch).toHaveBeenCalledWith({ url: "/features/home/pages/HomePage" });
    expect(navigateBack).not.toHaveBeenCalled();
  });
});
