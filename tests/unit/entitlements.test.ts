import { describe, it, expect } from "vitest";
import {
  entitlementsForPlan,
  canActivateListing,
  canAddActiveStudent,
  canCreateRecurringLesson,
  isPremiumEffective,
  entitlementRows,
  requireEntitlement,
} from "@/lib/domain/entitlements";

const DAY = 86_400_000;

describe("plan entitlement snapshots", () => {
  it("Free: 1 listing, 3 students, no recurring/advanced", () => {
    const s = entitlementsForPlan("FREE");
    expect(s.listingsMaxActive).toBe(1);
    expect(s.studentsMaxActive).toBe(3);
    expect(s.recurringLessons).toBe(false);
    expect(s.advancedCalendar).toBe(false);
    expect(s.advancedCrm).toBe(false);
  });
  it("Premium: unlimited + all advanced", () => {
    const s = entitlementsForPlan("PREMIUM");
    expect(s.listingsMaxActive).toBe(Number.POSITIVE_INFINITY);
    expect(s.studentsMaxActive).toBe(Number.POSITIVE_INFINITY);
    expect(s.recurringLessons).toBe(true);
    expect(s.growthDashboard).toBe(true);
  });
});

describe("listing activation limit", () => {
  it("Free blocks a 2nd active listing with an upgrade reason", () => {
    const s = entitlementsForPlan("FREE");
    expect(canActivateListing(s, 0).allowed).toBe(true);
    const blocked = canActivateListing(s, 1);
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) expect(blocked.upgradeRequired).toBe(true);
  });
  it("Premium never blocks", () => {
    const s = entitlementsForPlan("PREMIUM");
    expect(canActivateListing(s, 999).allowed).toBe(true);
  });
});

describe("active-student limit", () => {
  it("Free blocks the 4th active student", () => {
    const s = entitlementsForPlan("FREE");
    expect(canAddActiveStudent(s, 2).allowed).toBe(true);
    expect(canAddActiveStudent(s, 3).allowed).toBe(false);
  });
});

describe("recurring lessons", () => {
  it("Free cannot, Premium can", () => {
    expect(canCreateRecurringLesson(entitlementsForPlan("FREE")).allowed).toBe(false);
    expect(canCreateRecurringLesson(entitlementsForPlan("PREMIUM")).allowed).toBe(true);
  });
});

describe("requireEntitlement", () => {
  it("gates advanced calendar / crm / growth", () => {
    const free = entitlementsForPlan("FREE");
    expect(requireEntitlement(free, "calendar.advanced").allowed).toBe(false);
    expect(requireEntitlement(free, "crm.advanced").allowed).toBe(false);
    expect(requireEntitlement(free, "dashboard.growth").allowed).toBe(false);
  });
});

describe("isPremiumEffective", () => {
  const now = new Date("2026-09-01T00:00:00Z");
  it("live trial grants Premium", () => {
    expect(isPremiumEffective({ status: "TRIALING", trialEndsAt: new Date(+now + 5 * DAY), now })).toBe(true);
  });
  it("expired trial does not", () => {
    expect(isPremiumEffective({ status: "TRIALING", trialEndsAt: new Date(+now - DAY), now })).toBe(false);
  });
  it("cancelled but within paid period still Premium (non-destructive downgrade)", () => {
    expect(isPremiumEffective({ status: "CANCELLED", currentPeriodEnd: new Date(+now + 3 * DAY), now })).toBe(true);
  });
  it("cancelled after period end is Free", () => {
    expect(isPremiumEffective({ status: "CANCELLED", currentPeriodEnd: new Date(+now - DAY), now })).toBe(false);
  });
  it("no subscription is Free", () => {
    expect(isPremiumEffective({ status: null, now })).toBe(false);
  });
});

describe("entitlementRows (persisted snapshot)", () => {
  it("serialises unlimited as 'unlimited'", () => {
    const rows = entitlementRows("PREMIUM");
    expect(rows.find((r) => r.key === "listings.maxActive")?.value).toBe("unlimited");
  });
  it("serialises Free numeric limits", () => {
    const rows = entitlementRows("FREE");
    expect(rows.find((r) => r.key === "students.maxActive")?.value).toBe("3");
  });
});
