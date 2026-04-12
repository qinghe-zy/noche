export type AppThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export function resolveThemeMode(theme: AppThemeMode): ResolvedTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
}

export function applyThemeMode(theme: AppThemeMode): void {
  const resolvedTheme = resolveThemeMode(theme);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolvedTheme;
    document.body?.setAttribute("data-theme", resolvedTheme);
    document
      .querySelectorAll(".uni-page-body, .uni-page-wrapper, page")
      .forEach((node) => node.setAttribute("data-theme", resolvedTheme));
  }
}
