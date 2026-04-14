function isWideCharacter(character: string): boolean {
  return /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF01-\uFF60\uFFE0-\uFFE6]/u.test(character);
}

function measureEditorCharacterWidth(character: string, fontSizePx: number): number {
  if (character === "\t") {
    return fontSizePx * 2;
  }

  if (character === " ") {
    return fontSizePx * 0.35;
  }

  if (isWideCharacter(character)) {
    return fontSizePx;
  }

  if (/[A-Z]/u.test(character)) {
    return fontSizePx * 0.68;
  }

  if (/[0-9]/u.test(character)) {
    return fontSizePx * 0.62;
  }

  if (/[a-z]/u.test(character)) {
    return fontSizePx * 0.56;
  }

  if (/[.,;:'"`~!?()[\]{}<>\\/_\-+=|]/u.test(character)) {
    return fontSizePx * 0.42;
  }

  return fontSizePx * 0.58;
}

export function estimateEditorSegmentVisualLines(
  segment: string,
  availableWidth: number,
  fontSizePx: number,
): number {
  if (!segment) {
    return 1;
  }

  let visualLineCount = 1;
  let currentLineWidth = 0;
  const letterSpacingPx = fontSizePx * 0.05;

  for (const character of Array.from(segment)) {
    const nextCharacterWidth = measureEditorCharacterWidth(character, fontSizePx) + letterSpacingPx;

    if (currentLineWidth > 0 && currentLineWidth + nextCharacterWidth > availableWidth) {
      visualLineCount += 1;
      currentLineWidth = 0;
    }

    currentLineWidth += nextCharacterWidth;
  }

  return visualLineCount;
}

function countVisualLines(
  content: string,
  availableWidth: number,
  fontSizePx: number,
): number {
  return content
    .split(/\r?\n/u)
    .reduce(
      (totalLineCount, segment) =>
        totalLineCount + estimateEditorSegmentVisualLines(segment, availableWidth, fontSizePx),
      0,
    );
}

export function estimateEditorContentHeight({
  content,
  availableWidth,
  fontSizePx,
  lineHeightPx,
}: {
  content: string;
  availableWidth: number;
  fontSizePx: number;
  lineHeightPx: number;
}): number {
  const visualLineCount = Math.max(countVisualLines(content, availableWidth, fontSizePx), 1);
  return visualLineCount * lineHeightPx;
}

export function estimateEditorCaretLineBottom({
  content,
  cursor,
  availableWidth,
  fontSizePx,
  lineHeightPx,
}: {
  content: string;
  cursor: number;
  availableWidth: number;
  fontSizePx: number;
  lineHeightPx: number;
}): number {
  const clampedCursor = Math.max(0, Math.min(cursor, content.length));
  const contentBeforeCaret = content.slice(0, clampedCursor);
  const visualLineCount = Math.max(countVisualLines(contentBeforeCaret, availableWidth, fontSizePx), 1);

  return visualLineCount * lineHeightPx;
}

export function resolveCaretAwareScrollTop({
  caretLineBottom,
  viewportHeight,
  minLineGapToKeyboard,
}: {
  caretLineBottom: number;
  viewportHeight: number;
  minLineGapToKeyboard: number;
}): number {
  return Math.max(caretLineBottom - viewportHeight + minLineGapToKeyboard, 0);
}

export function resolveTapCaretLineBottom({
  tapClientY,
  viewportTop,
  currentScrollTop,
  lineHeightPx,
}: {
  tapClientY: number | null | undefined;
  viewportTop: number | null | undefined;
  currentScrollTop: number;
  lineHeightPx: number;
}): number | null {
  if (
    typeof tapClientY !== "number"
    || typeof viewportTop !== "number"
    || !Number.isFinite(tapClientY)
    || !Number.isFinite(viewportTop)
  ) {
    return null;
  }

  const localY = tapClientY - viewportTop;
  if (!Number.isFinite(localY)) {
    return null;
  }

  return Math.max(currentScrollTop + localY + lineHeightPx * 0.5, lineHeightPx);
}
