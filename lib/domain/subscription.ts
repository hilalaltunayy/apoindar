import {
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
  PREMIUM_TRIAL_REQUIRES_CARD,
} from "@/lib/config/commerce";

export type BillingInterval = "MONTH" | "YEAR";
export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addInterval(date: Date, interval: BillingInterval): Date {
  const d = new Date(date);
  if (interval === "MONTH") d.setUTCMonth(d.getUTCMonth() + 1);
  else d.setUTCFullYear(d.getUTCFullYear() + 1);
  return d;
}

export function priceForInterval(interval: BillingInterval): number {
  return interval === "MONTH" ? PREMIUM_PRICE.MONTH : PREMIUM_PRICE.YEAR;
}

/** Start a 14-day, no-card trial (03 §5, 10 §4). */
export function startTrial(now: Date = new Date()) {
  return {
    status: "TRIALING" as SubscriptionStatus,
    requiresCard: PREMIUM_TRIAL_REQUIRES_CARD,
    trialStartedAt: now,
    trialEndsAt: addDays(now, PREMIUM_TRIAL_DAYS),
  };
}

export function isTrialExpired(trialEndsAt: Date | null | undefined, now: Date = new Date()): boolean {
  return !!trialEndsAt && trialEndsAt <= now;
}

/** Activate a paid subscription from `now`, setting the first billing period. */
export function activatePaid(interval: BillingInterval, now: Date = new Date()) {
  return {
    status: "ACTIVE" as SubscriptionStatus,
    interval,
    priceAmount: priceForInterval(interval),
    currentPeriodStart: now,
    currentPeriodEnd: addInterval(now, interval),
    cancelAtPeriodEnd: false,
  };
}

/**
 * Cancel: Premium stays active until the paid period ends, then downgrades to Free.
 * Non-destructive (10 §11).
 */
export function cancelAtPeriodEnd(now: Date = new Date()) {
  return { cancelAtPeriodEnd: true, cancelledAt: now, status: "CANCELLED" as SubscriptionStatus };
}

/** Effective plan for entitlement purposes at `now`. */
export function effectivePlan(sub: {
  status: SubscriptionStatus;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
}, now: Date = new Date()): "FREE" | "PREMIUM" {
  switch (sub.status) {
    case "ACTIVE":
    case "PAST_DUE":
      return !sub.currentPeriodEnd || sub.currentPeriodEnd > now ? "PREMIUM" : "FREE";
    case "TRIALING":
      return sub.trialEndsAt && sub.trialEndsAt > now ? "PREMIUM" : "FREE";
    case "CANCELLED":
      return sub.currentPeriodEnd && sub.currentPeriodEnd > now ? "PREMIUM" : "FREE";
    default:
      return "FREE";
  }
}
