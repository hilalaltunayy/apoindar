import { PLAN_LIMITS, type ProviderPlan } from "@/lib/config/commerce";

export type EntitlementKey =
  | "listings.maxActive"
  | "students.maxActive"
  | "calendar.recurring"
  | "calendar.advanced"
  | "crm.advanced"
  | "dashboard.growth";

export interface EntitlementSnapshot {
  plan: ProviderPlan;
  listingsMaxActive: number;
  studentsMaxActive: number;
  recurringLessons: boolean;
  advancedCalendar: boolean;
  advancedCrm: boolean;
  growthDashboard: boolean;
}

/** Whether Premium entitlements are currently in force (active sub OR live trial). */
export function isPremiumEffective(input: {
  status?: string | null;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
  now?: Date;
}): boolean {
  const now = input.now ?? new Date();
  if (input.status === "ACTIVE" || input.status === "PAST_DUE") {
    // PAST_DUE keeps entitlements during grace (10 §12)
    return !input.currentPeriodEnd || input.currentPeriodEnd > now;
  }
  if (input.status === "TRIALING") {
    return !!input.trialEndsAt && input.trialEndsAt > now;
  }
  if (input.status === "CANCELLED") {
    // remains Premium until the already-paid period ends (10 §11)
    return !!input.currentPeriodEnd && input.currentPeriodEnd > now;
  }
  return false;
}

export function entitlementsForPlan(plan: ProviderPlan): EntitlementSnapshot {
  const l = PLAN_LIMITS[plan];
  return {
    plan,
    listingsMaxActive: l.activeListings,
    studentsMaxActive: l.activeStudents,
    recurringLessons: l.recurringLessons,
    advancedCalendar: l.advancedCalendar,
    advancedCrm: l.advancedCrm,
    growthDashboard: l.growthDashboard,
  };
}

/**
 * Stable machine codes for blocked-entitlement outcomes. The UI maps these to
 * localized copy (messages: `entitlementErrors.<code>`); `reason` is the English
 * fallback for logs / non-UI consumers.
 */
export type EntitlementCode =
  | "LISTING_LIMIT_FREE"
  | "LISTING_LIMIT"
  | "STUDENT_LIMIT_FREE"
  | "STUDENT_LIMIT"
  | "RECURRING_PREMIUM_ONLY"
  | "PREMIUM_FEATURE";

export type EntitlementCheck =
  | { allowed: true }
  | { allowed: false; code: EntitlementCode; reason: string; upgradeRequired: boolean };

export function canActivateListing(
  snapshot: EntitlementSnapshot,
  currentActiveCount: number,
): EntitlementCheck {
  if (currentActiveCount < snapshot.listingsMaxActive) return { allowed: true };
  return snapshot.plan === "FREE"
    ? {
        allowed: false,
        upgradeRequired: true,
        code: "LISTING_LIMIT_FREE",
        reason: "Free providers can have 1 active lesson or package. Upgrade to Premium for unlimited listings.",
      }
    : { allowed: false, upgradeRequired: true, code: "LISTING_LIMIT", reason: "Active listing limit reached." };
}

export function canAddActiveStudent(
  snapshot: EntitlementSnapshot,
  currentActiveCount: number,
): EntitlementCheck {
  if (currentActiveCount < snapshot.studentsMaxActive) return { allowed: true };
  return snapshot.plan === "FREE"
    ? {
        allowed: false,
        upgradeRequired: true,
        code: "STUDENT_LIMIT_FREE",
        reason: "Free providers can manage 3 active students. Upgrade to Premium for unlimited students.",
      }
    : { allowed: false, upgradeRequired: true, code: "STUDENT_LIMIT", reason: "Active student limit reached." };
}

export function canCreateRecurringLesson(snapshot: EntitlementSnapshot): EntitlementCheck {
  if (snapshot.recurringLessons) return { allowed: true };
  return {
    allowed: false,
    upgradeRequired: true,
    code: "RECURRING_PREMIUM_ONLY",
    reason: "Recurring lessons are a Premium feature.",
  };
}

export function requireEntitlement(
  snapshot: EntitlementSnapshot,
  key: Extract<EntitlementKey, "calendar.advanced" | "crm.advanced" | "dashboard.growth">,
): EntitlementCheck {
  const map: Record<typeof key, boolean> = {
    "calendar.advanced": snapshot.advancedCalendar,
    "crm.advanced": snapshot.advancedCrm,
    "dashboard.growth": snapshot.growthDashboard,
  };
  if (map[key]) return { allowed: true };
  return {
    allowed: false,
    upgradeRequired: true,
    code: "PREMIUM_FEATURE",
    reason: "This is a Premium feature.",
  };
}

/** Flat key/value pairs persisted as SubscriptionEntitlement rows. */
export function entitlementRows(plan: ProviderPlan): Array<{ key: EntitlementKey; value: string }> {
  const s = entitlementsForPlan(plan);
  const num = (n: number) => (Number.isFinite(n) ? String(n) : "unlimited");
  return [
    { key: "listings.maxActive", value: num(s.listingsMaxActive) },
    { key: "students.maxActive", value: num(s.studentsMaxActive) },
    { key: "calendar.recurring", value: String(s.recurringLessons) },
    { key: "calendar.advanced", value: String(s.advancedCalendar) },
    { key: "crm.advanced", value: String(s.advancedCrm) },
    { key: "dashboard.growth", value: String(s.growthDashboard) },
  ];
}
