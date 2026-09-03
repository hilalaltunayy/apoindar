import { COMMISSION_RATE, type ProviderPlan } from "@/lib/config/commerce";
import { splitCommission } from "@/lib/money";

export interface CommissionBreakdown {
  plan: ProviderPlan;
  rate: number;
  grossAmount: number;
  platformCommission: number;
  processorFee: number;
  providerNet: number;
  currency: string;
}

/**
 * Resolve the commission rate for a booking.
 *
 * Locked effective-time rule (10 §10): the rate is determined by the provider
 * plan effective at the moment the booking payment is successfully
 * created/authorized — NOT at booking creation or at payout.
 */
export function resolveCommissionRate(
  planAtAuthorization: ProviderPlan,
  overrides?: Partial<Record<ProviderPlan, number>>,
): number {
  return overrides?.[planAtAuthorization] ?? COMMISSION_RATE[planAtAuthorization];
}

/**
 * Compute the full money split for a payment.
 * `processorFee` is the payment-provider cost and is tracked separately from the
 * marketplace commission (03 §9, 10 §16). It never reduces platform commission.
 */
export function computeCommission(params: {
  grossAmount: number;
  planAtAuthorization: ProviderPlan;
  processorFee?: number;
  currency?: string;
  rateOverrides?: Partial<Record<ProviderPlan, number>>;
}): CommissionBreakdown {
  const rate = resolveCommissionRate(params.planAtAuthorization, params.rateOverrides);
  const { gross, commission, providerNet } = splitCommission(params.grossAmount, rate);
  const processorFee = params.processorFee ?? 0;
  return {
    plan: params.planAtAuthorization,
    rate,
    grossAmount: gross,
    platformCommission: commission,
    processorFee,
    providerNet: providerNet - processorFee,
    currency: params.currency ?? "TRY",
  };
}

/** Estimated commission a provider would save per period by switching Free → Premium. */
export function estimatePremiumCommissionSaving(monthlyPlatformVolume: number): number {
  const free = splitCommission(Math.max(0, Math.round(monthlyPlatformVolume)), COMMISSION_RATE.FREE);
  const premium = splitCommission(
    Math.max(0, Math.round(monthlyPlatformVolume)),
    COMMISSION_RATE.PREMIUM,
  );
  return free.commission - premium.commission;
}
