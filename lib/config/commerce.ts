/**
 * Apoindar commercial configuration — SINGLE source of truth for money rules.
 * Locked values: 06-decision-log.md, 10-business-rules-and-premium.md.
 *
 * Commercial values MUST live here (or in DB CommissionRule overrides) and never
 * be hardcoded in UI components. All monetary amounts are integer minor units
 * (kuruş) in TRY unless stated otherwise.
 */

export const CURRENCY = "TRY" as const;

/** 100 kuruş = 1 TRY */
export const MINOR_UNITS_PER_MAJOR = 100;

export type ProviderPlan = "FREE" | "PREMIUM";

/** Marketplace commission taken by Apoindar on a successful in-platform payment. */
export const COMMISSION_RATE: Record<ProviderPlan, number> = {
  FREE: 0.12, // 12%
  PREMIUM: 0.07, // 7%
};

/** Student-side platform/service fee. V1 = 0% (10 §17). Do not change without a product decision. */
export const STUDENT_SERVICE_FEE_RATE = 0;

/** Premium subscription pricing (minor units). */
export const PREMIUM_PRICE = {
  MONTH: 299_00, // 299 TRY / month
  YEAR: 2_990_00, // 2,990 TRY / year
} as const;

/** Premium trial: 14 days, no card required (03 §5, 10 §4). */
export const PREMIUM_TRIAL_DAYS = 14;
export const PREMIUM_TRIAL_REQUIRES_CARD = false;

/** Free-plan hard limits (server-enforced). "Infinity" = unlimited for Premium. */
export const PLAN_LIMITS: Record<
  ProviderPlan,
  { activeListings: number; activeStudents: number; recurringLessons: boolean; advancedCalendar: boolean; advancedCrm: boolean; growthDashboard: boolean }
> = {
  FREE: {
    activeListings: 1,
    activeStudents: 3,
    recurringLessons: false,
    advancedCalendar: false,
    advancedCrm: false,
    growthDashboard: false,
  },
  PREMIUM: {
    activeListings: Number.POSITIVE_INFINITY,
    activeStudents: Number.POSITIVE_INFINITY,
    recurringLessons: true,
    advancedCalendar: true,
    advancedCrm: true,
    growthDashboard: true,
  },
};

/**
 * Break-even volume where the 5pp commission saving covers the monthly Premium price.
 * 299 / 0.05 = 5,980 TRY (03 §6). Derived, not hardcoded elsewhere.
 */
export const COMMISSION_SPREAD =
  Math.round((COMMISSION_RATE.FREE - COMMISSION_RATE.PREMIUM) * 1e4) / 1e4; // 0.05

export const PREMIUM_MONTHLY_BREAK_EVEN_VOLUME = Math.round(
  PREMIUM_PRICE.MONTH / COMMISSION_SPREAD,
);

/**
 * Assumed payment-processor fee for *display/estimation only* in dev.
 * The real fee comes from the provider and is stored per-payment. NOT the marketplace commission (03 §9).
 */
export const ESTIMATED_PROCESSOR_FEE_RATE = 0; // unknown until provider selected — keep 0 in V1
