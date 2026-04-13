import type { EntryType } from "@/domain/entry/types";
import type { SettingsState } from "@/app/store/useSettingsStore";

export interface EditorWritingAppearance {
  fontSizePx: number;
  lineHeightPx: number;
  paperLineHeightPx: number;
}

const WRITING_PRESET_TOKENS: Record<SettingsState["writingPreset"], Record<EntryType, EditorWritingAppearance>> = {
  small: {
    diary: { fontSizePx: 16, lineHeightPx: 36, paperLineHeightPx: 36 },
    jotting: { fontSizePx: 16, lineHeightPx: 34, paperLineHeightPx: 34 },
    future: { fontSizePx: 16, lineHeightPx: 40, paperLineHeightPx: 40 },
  },
  medium: {
    diary: { fontSizePx: 18, lineHeightPx: 40, paperLineHeightPx: 40 },
    jotting: { fontSizePx: 18, lineHeightPx: 36, paperLineHeightPx: 36 },
    future: { fontSizePx: 18, lineHeightPx: 44, paperLineHeightPx: 44 },
  },
  large: {
    diary: { fontSizePx: 20, lineHeightPx: 44, paperLineHeightPx: 44 },
    jotting: { fontSizePx: 20, lineHeightPx: 40, paperLineHeightPx: 40 },
    future: { fontSizePx: 20, lineHeightPx: 48, paperLineHeightPx: 48 },
  },
};

export function resolveEditorWritingAppearance(
  entryType: EntryType,
  preset: SettingsState["writingPreset"],
): EditorWritingAppearance {
  return WRITING_PRESET_TOKENS[preset][entryType];
}
