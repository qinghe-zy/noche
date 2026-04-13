interface NavigateBackOrFallbackOptions {
  fallbackUrl: string;
  canNavigateBack?: boolean;
  navigateBack?: (options: { delta: number }) => void;
  reLaunch?: (options: { url: string }) => void;
}

export function canNavigateBack(): boolean {
  if (typeof getCurrentPages !== "function") {
    return false;
  }

  return getCurrentPages().length > 1;
}

export function navigateBackOrFallback(options: NavigateBackOrFallbackOptions): void {
  const shouldNavigateBack = options.canNavigateBack ?? canNavigateBack();
  const navigateBack = options.navigateBack ?? uni.navigateBack;
  const reLaunch = options.reLaunch ?? uni.reLaunch;

  if (shouldNavigateBack) {
    navigateBack({ delta: 1 });
    return;
  }

  reLaunch({ url: options.fallbackUrl });
}
