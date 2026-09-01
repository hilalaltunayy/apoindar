import { describe, it, expect } from "vitest";
import {
  COMMISSION_RATE,
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
  PREMIUM_TRIAL_REQUIRES_CARD,
  STUDENT_SERVICE_FEE_RATE,
  PLAN_LIMITS,
  PREMIUM_MONTHLY_BREAK_EVEN_VOLUME,
} from "@/lib/config/commerce";

// 11 §4 — Required Locked Business Assertions
describe("locked commercial constants", () => {
  it("Free commission = 12%", () => expect(COMMISSION_RATE.FREE).toBe(0.12));
  it("Premium commission = 7%", () => expect(COMMISSION_RATE.PREMIUM).toBe(0.07));
  it("Free active lesson/package limit = 1", () =>
    expect(PLAN_LIMITS.FREE.activeListings).toBe(1));
  it("Premium active lesson/package limit = unlimited", () =>
    expect(PLAN_LIMITS.PREMIUM.activeListings).toBe(Number.POSITIVE_INFINITY));
  it("Free active students = 3", () => expect(PLAN_LIMITS.FREE.activeStudents).toBe(3));
  it("Premium active students = unlimited", () =>
    expect(PLAN_LIMITS.PREMIUM.activeStudents).toBe(Number.POSITIVE_INFINITY));
  it("recurring lessons = Premium only", () => {
    expect(PLAN_LIMITS.FREE.recurringLessons).toBe(false);
    expect(PLAN_LIMITS.PREMIUM.recurringLessons).toBe(true);
  });
  it("student service fee in V1 = 0%", () => expect(STUDENT_SERVICE_FEE_RATE).toBe(0));
  it("Premium monthly price = 299 TRY", () => expect(PREMIUM_PRICE.MONTH).toBe(299_00));
  it("Premium annual price = 2,990 TRY", () => expect(PREMIUM_PRICE.YEAR).toBe(2_990_00));
  it("Premium trial = 14 days, no card", () => {
    expect(PREMIUM_TRIAL_DAYS).toBe(14);
    expect(PREMIUM_TRIAL_REQUIRES_CARD).toBe(false);
  });
  it("break-even volume derives to 5,980 TRY", () =>
    expect(PREMIUM_MONTHLY_BREAK_EVEN_VOLUME).toBe(5_980_00));
});
