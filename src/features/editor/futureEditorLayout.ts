export type FutureContentChangeDirection = "grow" | "shrink" | "same";

export function resolveEditorLiveSpacing(baseSpacingPx: number, writingLineHeightPx: number): number {
  return Math.max(baseSpacingPx, writingLineHeightPx);
}

export function reconcileFutureMeasuredHeight({
  estimatedHeight,
  actualHeight,
  currentMeasuredHeight,
  lastContentChangeDirection,
  lineHeightPx,
}: {
  estimatedHeight: number;
  actualHeight: number;
  currentMeasuredHeight: number;
  lastContentChangeDirection: FutureContentChangeDirection;
  lineHeightPx: number;
}): number {
  const lineChangeCorrectionThresholdPx = Math.max(Math.round(lineHeightPx * 0.5), 12);

  if (
    lastContentChangeDirection === "shrink"
    && actualHeight > estimatedHeight + lineChangeCorrectionThresholdPx
  ) {
    return currentMeasuredHeight;
  }

  if (
    lastContentChangeDirection !== "grow"
    && Math.abs(actualHeight - currentMeasuredHeight) < lineChangeCorrectionThresholdPx
  ) {
    return currentMeasuredHeight;
  }

  return actualHeight;
}
