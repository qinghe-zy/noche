export type WritingSurfaceVariant = "diary" | "jotting" | "future";

export interface WritingSurfaceProfile {
  baseLines: number;
  bufferLines: number;
  linePitch: number;
  lineHeight: number;
  baselineOffset: number;
  firstLineOffset: number;
  footerReserve: number;
  comfortZoneRatio: number;
  anchorRatio: number;
  minScrollDelta: number;
}

export interface WritingSurfaceExpansionOptions {
  contentHeight: number;
  fallbackLineCount?: number;
  renderedLines: number;
  profile: WritingSurfaceProfile;
}

export interface WritingSurfaceExpansionResult {
  contentLines: number;
  targetLines: number;
  nextRenderedLines: number;
  targetHeight: number;
}

export interface WritingScrollTargetOptions {
  caretTop: number;
  currentScrollTop: number;
  bodyViewportHeight: number;
  contentHeight: number;
  profile: WritingSurfaceProfile;
}

export interface WritingScrollTargetResult {
  shouldScroll: boolean;
  comfortZone: number;
  targetScrollTop: number;
}

const WRITING_SURFACE_BASE_PROFILE: Omit<WritingSurfaceProfile, "baseLines"> = {
  bufferLines: 4,
  linePitch: 44,
  lineHeight: 44,
  baselineOffset: 7,
  firstLineOffset: 11,
  footerReserve: 24,
  comfortZoneRatio: 0.28,
  anchorRatio: 0.35,
  minScrollDelta: 24,
};

const WRITING_SURFACE_PROFILES: Record<WritingSurfaceVariant, WritingSurfaceProfile> = {
  diary: {
    ...WRITING_SURFACE_BASE_PROFILE,
    baseLines: 13,
  },
  jotting: {
    ...WRITING_SURFACE_BASE_PROFILE,
    baseLines: 12,
  },
  future: {
    ...WRITING_SURFACE_BASE_PROFILE,
    baseLines: 13,
  },
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function resolveWritingSurfaceProfile(variant: WritingSurfaceVariant): WritingSurfaceProfile {
  return WRITING_SURFACE_PROFILES[variant];
}

export function resolvePlainTextLineCount(value: string): number {
  if (!value) {
    return 1;
  }

  return value.split("\n").length;
}

export function resolveWritingContentLines(
  contentHeight: number,
  linePitch: number,
  fallbackLineCount = 1,
): number {
  if (contentHeight > 0 && linePitch > 0) {
    return Math.max(1, Math.ceil(contentHeight / linePitch));
  }

  return Math.max(1, fallbackLineCount);
}

export function resolveWritingSurfaceExpansion(
  options: WritingSurfaceExpansionOptions,
): WritingSurfaceExpansionResult {
  const { profile } = options;
  const contentLines = resolveWritingContentLines(
    options.contentHeight,
    profile.linePitch,
    options.fallbackLineCount,
  );
  const targetLines = Math.max(profile.baseLines, contentLines + profile.bufferLines);
  const nextRenderedLines = Math.max(options.renderedLines, targetLines);

  return {
    contentLines,
    targetLines,
    nextRenderedLines,
    targetHeight: profile.firstLineOffset + nextRenderedLines * profile.linePitch,
  };
}

export function resolveUsableWritingViewport(options: {
  viewportHeight: number;
  keyboardHeight: number;
  safeAreaBottom: number;
  footerReserve: number;
}): number {
  return Math.max(
    160,
    Math.round(options.viewportHeight - options.keyboardHeight - options.safeAreaBottom - options.footerReserve),
  );
}

export function resolveViewportScrollEnabled(options: {
  bodyViewportHeight: number;
  contentHeight: number;
}): boolean {
  return options.contentHeight > options.bodyViewportHeight + 1;
}

export function estimateCaretLine(options: {
  value: string;
  cursor: number;
  totalLineCount: number;
}): number {
  const explicitLines = resolvePlainTextLineCount(options.value);
  const cappedTotalLineCount = Math.max(explicitLines, options.totalLineCount || explicitLines);
  const clampedCursor = clamp(options.cursor, 0, options.value.length);
  const beforeCursor = options.value.slice(0, clampedCursor);
  const explicitCaretLine = resolvePlainTextLineCount(beforeCursor);

  if (cappedTotalLineCount === explicitLines) {
    return explicitCaretLine;
  }

  if (!options.value.length) {
    return 1;
  }

  const wrappedLineBudget = cappedTotalLineCount - explicitLines;
  const progress = clampedCursor / options.value.length;
  return clamp(
    Math.round(explicitCaretLine + wrappedLineBudget * progress),
    explicitCaretLine,
    cappedTotalLineCount,
  );
}

export function resolveWritingScrollTarget(
  options: WritingScrollTargetOptions,
): WritingScrollTargetResult {
  const comfortZone = options.bodyViewportHeight * options.profile.comfortZoneRatio;
  const caretViewportBottom =
    options.caretTop - options.currentScrollTop + options.profile.linePitch;

  if (caretViewportBottom <= options.bodyViewportHeight - comfortZone) {
    return {
      shouldScroll: false,
      comfortZone,
      targetScrollTop: options.currentScrollTop,
    };
  }

  const unclampedTarget = Math.round(
    options.caretTop - options.bodyViewportHeight * options.profile.anchorRatio,
  );
  const maxScrollTop = Math.max(0, options.contentHeight - options.bodyViewportHeight);
  const targetScrollTop = clamp(unclampedTarget, 0, maxScrollTop);

  if (Math.abs(targetScrollTop - options.currentScrollTop) < options.profile.minScrollDelta) {
    return {
      shouldScroll: false,
      comfortZone,
      targetScrollTop: options.currentScrollTop,
    };
  }

  return {
    shouldScroll: true,
    comfortZone,
    targetScrollTop,
  };
}
