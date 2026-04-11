export interface CalendarReflectionContext {
  recordDate: string | null;
  hasEntries: boolean;
  entryCount: number;
}

export interface CalendarReflectionProvider {
  getReflection(context: CalendarReflectionContext): Promise<string | null>;
}

let provider: CalendarReflectionProvider | null = null;

export function setCalendarReflectionProvider(nextProvider: CalendarReflectionProvider | null): void {
  provider = nextProvider;
}

function fallbackReflection(context: CalendarReflectionContext): string {
  if (!context.recordDate) {
    return "把日期轻轻翻开，看看哪一天想先重新走近。";
  }

  if (!context.hasEntries) {
    return `${context.recordDate} 还留着一页空白，适合写下今天想补上的一句话。`;
  }

  if (context.entryCount === 1) {
    return `${context.recordDate} 已经收好一封记录，不妨慢一点，再读一遍当时的心情。`;
  }

  return `${context.recordDate} 留下了不止一种声音，今天可以先从最想重读的那一页开始。`;
}

export async function resolveCalendarReflection(
  context: CalendarReflectionContext,
): Promise<string> {
  try {
    const reflection = await provider?.getReflection(context);
    if (reflection && reflection.trim()) {
      return reflection.trim();
    }
  } catch {
    // Swallow provider errors and fall back to local copy.
  }

  return fallbackReflection(context);
}
