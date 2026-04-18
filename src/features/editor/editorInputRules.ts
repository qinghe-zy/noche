import type { EntryType } from "@/domain/entry/types";

export const FULL_WIDTH_INDENT = "　　";

type NormalizeEditorInputOptions = {
  entryType: EntryType;
  previousValue: string;
  nextValue: string;
  cursor: number;
};

type NormalizeEditorInputResult = {
  value: string;
  cursor: number;
};

function getCommonPrefixLength(left: string, right: string): number {
  const maxLength = Math.min(left.length, right.length);
  let index = 0;

  while (index < maxLength && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function getCommonSuffixLength(left: string, right: string, prefixLength: number): number {
  const maxLength = Math.min(left.length, right.length) - prefixLength;
  let index = 0;

  while (
    index < maxLength
    && left[left.length - 1 - index] === right[right.length - 1 - index]
  ) {
    index += 1;
  }

  return index;
}

function insertMissingLineIndent(value: string): string {
  return value.replace(/\n(?!　　)/g, `\n${FULL_WIDTH_INDENT}`);
}

export function resolveEditorInitialContent(entryType: EntryType, currentValue: string): string {
  if (entryType === "future") {
    return currentValue;
  }

  return currentValue.trim().length > 0 ? currentValue : "";
}

export function isEditorContentVisuallyEmpty(entryType: EntryType, currentValue: string): boolean {
  if (entryType === "future") {
    return currentValue.trim().length === 0;
  }

  return currentValue.trim().length === 0 || currentValue === FULL_WIDTH_INDENT;
}

export function normalizeEditorInput({
  entryType,
  previousValue,
  nextValue,
  cursor,
}: NormalizeEditorInputOptions): NormalizeEditorInputResult {
  let value = nextValue;
  let nextCursor = cursor;
  void entryType;

  if (value.length > previousValue.length) {
    const prefixLength = getCommonPrefixLength(previousValue, value);
    const suffixLength = getCommonSuffixLength(previousValue, value, prefixLength);
    const insertionStart = prefixLength;
    const insertionEnd = value.length - suffixLength;
    const insertedText = value.slice(insertionStart, insertionEnd);
    const normalizedInsertedText = insertMissingLineIndent(insertedText);

    if (normalizedInsertedText !== insertedText) {
      value = `${value.slice(0, insertionStart)}${normalizedInsertedText}${value.slice(insertionEnd)}`;

      if (nextCursor > insertionStart) {
        nextCursor += normalizedInsertedText.length - insertedText.length;
      }
    }
  }

  return {
    value,
    cursor: nextCursor,
  };
}
