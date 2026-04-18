function coerceFiniteNumber(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}

function resolveFiniteMetricPair(from: number, to: number): [number, number] {
  const hasFiniteFrom = Number.isFinite(from);
  const hasFiniteTo = Number.isFinite(to);

  if (hasFiniteFrom && hasFiniteTo) {
    return [from, to];
  }

  if (hasFiniteFrom) {
    return [from, from];
  }

  if (hasFiniteTo) {
    return [to, to];
  }

  return [0, 0];
}

function clampProgress(value: number): number {
  if (Number.isNaN(value) || value === Number.NEGATIVE_INFINITY) {
    return 0;
  }

  if (value === Number.POSITIVE_INFINITY) {
    return 1;
  }

  return Math.max(0, Math.min(coerceFiniteNumber(value, 0), 1));
}

export function interpolateJottingMetric({
  progress,
  from,
  to,
}: {
  progress: number;
  from: number;
  to: number;
}): number {
  const safeProgress = clampProgress(progress);
  const [safeFrom, safeTo] = resolveFiniteMetricPair(from, to);

  return safeFrom + (safeTo - safeFrom) * safeProgress;
}

export function shouldKeepJottingExpanded({
  contentHeight,
  viewportHeight,
}: {
  contentHeight: number;
  viewportHeight: number;
}): boolean {
  if (!Number.isFinite(contentHeight) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) {
    return true;
  }

  return contentHeight <= viewportHeight;
}

export function resolveJottingEffectiveCollapseScroll({
  totalScrollTop,
  keyboardAvoidanceOffset,
}: {
  totalScrollTop: number;
  keyboardAvoidanceOffset: number;
}): number {
  if (!Number.isFinite(totalScrollTop) || !Number.isFinite(keyboardAvoidanceOffset)) {
    return 0;
  }

  const safeTotalScrollTop = Math.max(totalScrollTop, 0);
  const safeKeyboardAvoidanceOffset = Math.max(keyboardAvoidanceOffset, 0);

  return Math.max(safeTotalScrollTop - safeKeyboardAvoidanceOffset, 0);
}

export function resolveJottingCollapseProgress({
  effectiveCollapseScroll,
  collapseStart,
  collapseDistance,
}: {
  effectiveCollapseScroll: number;
  collapseStart: number;
  collapseDistance: number;
}): number {
  if (
    !Number.isFinite(effectiveCollapseScroll)
    || !Number.isFinite(collapseStart)
    || !Number.isFinite(collapseDistance)
    || collapseDistance <= 0
  ) {
    return 0;
  }

  return clampProgress((effectiveCollapseScroll - collapseStart) / collapseDistance);
}

export function resolveJottingProgressWindow({
  progress,
  start,
  end,
}: {
  progress: number;
  start: number;
  end: number;
}): number {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return 0;
  }

  const safeProgress = clampProgress(progress);

  if (safeProgress <= start) {
    return 0;
  }

  if (safeProgress >= end) {
    return 1;
  }

  return clampProgress((safeProgress - start) / (end - start));
}
