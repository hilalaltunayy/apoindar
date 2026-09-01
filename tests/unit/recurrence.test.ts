import { describe, it, expect } from "vitest";
import {
  generateRecurringLessons,
  findConflicts,
  overlaps,
} from "@/lib/domain/recurrence";
import { remainingCredits, consumeCredit, packageProgress, isPackageComplete } from "@/lib/domain/package-credit";

describe("recurring lesson generation — 'every Saturday 14:00 for 8 weeks'", () => {
  // 2026-08-31 is a Monday. weekday 5 = Saturday.
  const rule = {
    weekday: 5,
    startTime: "14:00",
    durationMin: 60,
    startDate: new Date("2026-08-31T00:00:00Z"),
    occurrences: 8,
  };
  it("creates exactly 8 weekly instances", () => {
    const lessons = generateRecurringLessons(rule);
    expect(lessons).toHaveLength(8);
  });
  it("first instance is the first Saturday on/after startDate at 14:00", () => {
    const [first] = generateRecurringLessons(rule);
    expect(first!.startsAt.toISOString()).toBe("2026-09-05T14:00:00.000Z");
    expect(first!.endsAt.toISOString()).toBe("2026-09-05T15:00:00.000Z");
  });
  it("instances are 7 days apart", () => {
    const lessons = generateRecurringLessons(rule);
    const gap = +lessons[1]!.startsAt - +lessons[0]!.startsAt;
    expect(gap).toBe(7 * 86_400_000);
  });
  it("rejects absurd inputs", () => {
    expect(() => generateRecurringLessons({ ...rule, occurrences: 100 })).toThrow();
    expect(() => generateRecurringLessons({ ...rule, startTime: "25:00" })).toThrow();
  });
});

describe("conflict detection", () => {
  it("overlap is half-open", () => {
    const a = { startsAt: new Date("2026-09-05T14:00:00Z"), endsAt: new Date("2026-09-05T15:00:00Z") };
    const back2back = { startsAt: new Date("2026-09-05T15:00:00Z"), endsAt: new Date("2026-09-05T16:00:00Z") };
    const clash = { startsAt: new Date("2026-09-05T14:30:00Z"), endsAt: new Date("2026-09-05T15:30:00Z") };
    expect(overlaps(a, back2back)).toBe(false);
    expect(overlaps(a, clash)).toBe(true);
  });
  it("findConflicts returns only colliding candidates", () => {
    const candidates = generateRecurringLessons({
      weekday: 5,
      startTime: "14:00",
      durationMin: 60,
      startDate: new Date("2026-08-31T00:00:00Z"),
      occurrences: 3,
    });
    const existing = [{ startsAt: new Date("2026-09-12T14:30:00Z"), endsAt: new Date("2026-09-12T15:30:00Z") }];
    expect(findConflicts(candidates, existing)).toHaveLength(1);
  });
});

describe("package credits", () => {
  it("tracks purchased vs consumed", () => {
    let s = { purchasedCount: 8, consumedCount: 0 };
    expect(remainingCredits(s)).toBe(8);
    s = consumeCredit(s);
    expect(remainingCredits(s)).toBe(7);
    expect(packageProgress(s)).toBeCloseTo(0.125);
  });
  it("cannot consume beyond purchased", () => {
    expect(() => consumeCredit({ purchasedCount: 1, consumedCount: 1 })).toThrow();
  });
  it("completion", () => {
    expect(isPackageComplete({ purchasedCount: 4, consumedCount: 4 })).toBe(true);
  });
});
