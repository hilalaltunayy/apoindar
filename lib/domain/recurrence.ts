/**
 * Recurring lesson generation — Premium only (10 §7).
 * "Every Saturday at 14:00 for 8 weeks" → 8 concrete lesson instances.
 */

export interface RecurringRuleInput {
  weekday: number; // 0=Mon … 6=Sun
  startTime: string; // "14:00"
  durationMin: number;
  startDate: Date; // first candidate date (local midnight)
  occurrences: number;
}

export interface GeneratedLesson {
  startsAt: Date;
  endsAt: Date;
  index: number;
}

function parseHhMm(value: string): { h: number; m: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error(`Invalid time "${value}", expected HH:MM`);
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) throw new Error(`Time out of range "${value}"`);
  return { h, m };
}

/** JS getUTCDay: 0=Sun..6=Sat → our weekday: 0=Mon..6=Sun */
function toMondayIndex(jsDay: number): number {
  return (jsDay + 6) % 7;
}

export function generateRecurringLessons(rule: RecurringRuleInput): GeneratedLesson[] {
  if (rule.occurrences < 1 || rule.occurrences > 52) {
    throw new Error("occurrences must be between 1 and 52");
  }
  if (rule.durationMin < 15 || rule.durationMin > 480) {
    throw new Error("durationMin must be between 15 and 480");
  }
  const { h, m } = parseHhMm(rule.startTime);

  // find first date on/after startDate that matches the weekday
  const cursor = new Date(
    Date.UTC(
      rule.startDate.getUTCFullYear(),
      rule.startDate.getUTCMonth(),
      rule.startDate.getUTCDate(),
      h,
      m,
      0,
      0,
    ),
  );
  while (toMondayIndex(cursor.getUTCDay()) !== rule.weekday) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const lessons: GeneratedLesson[] = [];
  for (let i = 0; i < rule.occurrences; i++) {
    const startsAt = new Date(cursor);
    const endsAt = new Date(startsAt.getTime() + rule.durationMin * 60_000);
    lessons.push({ startsAt, endsAt, index: i });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
  return lessons;
}

export interface TimeRange {
  startsAt: Date;
  endsAt: Date;
}

export function overlaps(a: TimeRange, b: TimeRange): boolean {
  return a.startsAt < b.endsAt && b.startsAt < a.endsAt;
}

/** Return the subset of `candidates` that collide with any existing range. */
export function findConflicts(candidates: TimeRange[], existing: TimeRange[]): TimeRange[] {
  return candidates.filter((c) => existing.some((e) => overlaps(c, e)));
}
