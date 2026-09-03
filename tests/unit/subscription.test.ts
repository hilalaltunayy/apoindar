import { describe, it, expect } from "vitest";
import {
  startTrial,
  isTrialExpired,
  activatePaid,
  cancelAtPeriodEnd,
  effectivePlan,
  priceForInterval,
  addInterval,
} from "@/lib/domain/subscription";

describe("Premium trial (14 days, no card)", () => {
  const now = new Date("2026-09-01T12:00:00Z");
  it("ends exactly 14 days later and requires no card", () => {
    const t = startTrial(now);
    expect(t.requiresCard).toBe(false);
    expect(t.trialEndsAt.toISOString()).toBe("2026-09-15T12:00:00.000Z");
  });
  it("expiry check", () => {
    expect(isTrialExpired(new Date("2026-09-15T12:00:01Z"), new Date("2026-09-16T00:00:00Z"))).toBe(true);
    expect(isTrialExpired(new Date("2026-09-15T12:00:00Z"), new Date("2026-09-10T00:00:00Z"))).toBe(false);
  });
});

describe("paid subscription", () => {
  const now = new Date("2026-09-01T00:00:00Z");
  it("monthly price 299 TRY, period +1 month", () => {
    const s = activatePaid("MONTH", now);
    expect(s.priceAmount).toBe(299_00);
    expect(s.currentPeriodEnd.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });
  it("annual price 2,990 TRY, period +1 year", () => {
    const s = activatePaid("YEAR", now);
    expect(s.priceAmount).toBe(2_990_00);
    expect(s.currentPeriodEnd.toISOString()).toBe("2027-09-01T00:00:00.000Z");
  });
  it("priceForInterval / addInterval helpers", () => {
    expect(priceForInterval("MONTH")).toBe(299_00);
    expect(addInterval(now, "YEAR").getUTCFullYear()).toBe(2027);
  });
});

describe("non-destructive downgrade (10 §11)", () => {
  const now = new Date("2026-09-10T00:00:00Z");
  const periodEnd = new Date("2026-09-30T00:00:00Z");
  it("cancel keeps Premium until paid period end, then Free", () => {
    const c = cancelAtPeriodEnd(now);
    expect(c.cancelAtPeriodEnd).toBe(true);
    expect(effectivePlan({ status: c.status, currentPeriodEnd: periodEnd }, now)).toBe("PREMIUM");
    expect(
      effectivePlan({ status: c.status, currentPeriodEnd: periodEnd }, new Date("2026-10-01T00:00:00Z")),
    ).toBe("FREE");
  });
});

describe("effectivePlan", () => {
  const now = new Date("2026-09-01T00:00:00Z");
  it("TRIALING within window = PREMIUM", () => {
    expect(effectivePlan({ status: "TRIALING", trialEndsAt: new Date("2026-09-10T00:00:00Z") }, now)).toBe("PREMIUM");
  });
  it("EXPIRED = FREE", () => {
    expect(effectivePlan({ status: "EXPIRED" }, now)).toBe("FREE");
  });
});
