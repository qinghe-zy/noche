export type PreludeGlyphKind = "weather" | "mood";

function encodeSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/")
    .replace(/%22/g, "'")
    .replace(/%2C/g, ",")
    .replace(/%3B/g, ";")
    .replace(/%28/g, "(")
    .replace(/%29/g, ")")}`;
}

const WEATHER_FALLBACK_SVGS = {
  sunny: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3.5V6.2"/>
        <path d="M12 17.8V20.5"/>
        <path d="M5.6 5.6L7.5 7.5"/>
        <path d="M16.5 16.5L18.4 18.4"/>
        <path d="M3.5 12H6.2"/>
        <path d="M17.8 12H20.5"/>
        <path d="M5.6 18.4L7.5 16.5"/>
        <path d="M16.5 7.5L18.4 5.6"/>
        <circle cx="12" cy="12" r="4.2"/>
      </g>
    </svg>
  `),
  cloudy: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <path d="M6.1 18.3H17.4C19.5 18.3 21 16.9 21 15.1C21 13.4 19.7 12 17.9 11.8C17.4 9.4 15.3 7.7 12.8 7.7C10.4 7.7 8.4 9.1 7.6 11.2C5.6 11.4 4 12.9 4 14.9C4 16.8 5.5 18.3 7.4 18.3Z" stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `),
  rainy: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6.1 14.8H17.2C19.1 14.8 20.5 13.5 20.5 11.9C20.5 10.4 19.4 9.2 17.8 9C17.3 6.9 15.4 5.4 13.1 5.4C10.9 5.4 9 6.7 8.3 8.7C6.4 8.9 5 10.3 5 12.1C5 13.7 6.4 14.8 8.1 14.8Z"/>
        <path d="M9 17L8 19.2"/>
        <path d="M12.4 17L11.4 19.2"/>
        <path d="M15.8 17L14.8 19.2"/>
      </g>
    </svg>
  `),
  windy: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11.5C6.3 10.8 7.8 10.4 9.6 10.4C12.4 10.4 14.4 11.7 16.4 11.7C17.9 11.7 19.2 11.2 20.2 10.6"/>
        <path d="M5.1 15.4C6.8 14.9 8.1 14.6 9.8 14.6C12.2 14.6 14.5 15.6 16.6 15.6C17.8 15.6 18.9 15.3 20 14.9"/>
        <path d="M7.1 8.4L9.2 6.3"/>
        <path d="M14.8 18.1L16.6 19.9"/>
      </g>
    </svg>
  `),
} as const;

const MOOD_FALLBACK_SVGS = {
  calm: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8.6 10C8.9 9.4 9.5 9 10 9"/>
        <path d="M14 9C14.5 9 15.1 9.4 15.4 10"/>
        <path d="M8.4 15.1C9.7 15.8 10.9 16.1 12 16.1C13.2 16.1 14.4 15.8 15.6 15.1"/>
      </g>
    </svg>
  `),
  joyful: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8.3 9.9C8.7 9.2 9.4 8.8 10.1 8.8"/>
        <path d="M13.9 8.8C14.6 8.8 15.3 9.2 15.7 9.9"/>
        <path d="M8.6 13.9C9.6 15.9 11.1 16.6 12.9 16.6C14.7 16.6 16.2 15.9 17.2 13.9"/>
      </g>
    </svg>
  `),
  anxious: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8.6 9.5C8.6 9.5 9.1 8.6 10 9.1"/>
        <path d="M14 9.1C14.9 8.6 15.4 9.5 15.4 9.5"/>
        <path d="M8.1 15.9C8.6 15.4 9.4 16.2 10 15.8C10.6 15.4 11.4 16.2 12 15.8C12.6 15.4 13.4 16.2 14 15.8C14.6 15.4 15.4 16.2 15.9 15.9"/>
      </g>
      <circle cx="9.6" cy="11.5" r="1.2" fill="#635f55"/>
      <circle cx="14.4" cy="11.5" r="1.2" fill="#635f55"/>
      <path d="M17.5 7.4C17.5 8.1 16.9 8.6 16.3 8.6C15.6 8.6 16.3 7.4 16.3 7.4C16.3 7.4 16.9 6.8 17.5 7.4Z" fill="rgba(177,179,171,0.22)" stroke="#8f948a" stroke-width="1.15" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `),
  melancholy: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8.6 9.7H10"/>
        <path d="M14 9.7H15.4"/>
        <path d="M8.2 16.2C9.4 14.9 10.8 14.3 12.2 14.3C13.9 14.3 15.1 14.8 16 16"/>
      </g>
    </svg>
  `),
  relieved: encodeSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
      <g stroke="#635f55" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"/>
        <path d="M8.2 9.8C8.7 10.3 9.2 10.5 9.8 10.5"/>
        <path d="M14.2 10.5C14.8 10.5 15.3 10.3 15.8 9.8"/>
        <path d="M8.8 14.9C9.8 16 11 16.5 12.2 16.5C13.7 16.5 14.8 15.9 15.8 14.7"/>
      </g>
    </svg>
  `),
} as const;

const WEATHER_ICON_PATHS: Record<string, string> = WEATHER_FALLBACK_SVGS;

const MOOD_ICON_PATHS: Record<string, string> = MOOD_FALLBACK_SVGS;

export function resolvePreludeGlyphPrimarySource(kind: PreludeGlyphKind, code: string): string {
  return kind === "weather"
    ? (WEATHER_ICON_PATHS[code] ?? WEATHER_ICON_PATHS.sunny)
    : (MOOD_ICON_PATHS[code] ?? MOOD_ICON_PATHS.calm);
}

export function resolvePreludeGlyphFallbackSource(kind: PreludeGlyphKind, code: string): string {
  return kind === "weather"
    ? (WEATHER_FALLBACK_SVGS[code as keyof typeof WEATHER_FALLBACK_SVGS] ?? WEATHER_FALLBACK_SVGS.sunny)
    : (MOOD_FALLBACK_SVGS[code as keyof typeof MOOD_FALLBACK_SVGS] ?? MOOD_FALLBACK_SVGS.calm);
}
