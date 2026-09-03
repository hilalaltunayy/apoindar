import "server-only";
import { prisma } from "@/lib/prisma";
import { estimatePremiumCommissionSaving } from "@/lib/domain/commission";
import { COMMISSION_RATE } from "@/lib/config/commerce";

export interface EarningsSummary {
  currency: string;
  grossSales: number;
  platformCommission: number;
  processorFees: number;
  providerNet: number;
  refunded: number;
  pendingPayout: number;
  paidOut: number;
  currentPlan: "FREE" | "PREMIUM";
  currentCommissionRate: number;
  estimatedPremiumMonthlySaving: number;
}

/** Aggregate a provider's money flow for the Earnings page (08 §15). */
export async function getEarningsSummary(providerId: string): Promise<EarningsSummary> {
  const [provider, payments, payouts] = await Promise.all([
    prisma.provider.findUniqueOrThrow({
      where: { id: providerId },
      select: { plan: true, currency: true },
    }),
    prisma.payment.findMany({
      where: { booking: { providerId }, status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED", "REFUNDED"] } },
      select: {
        grossAmount: true,
        platformCommission: true,
        processorFee: true,
        providerNet: true,
        refundedAmount: true,
        succeededAt: true,
      },
    }),
    prisma.providerPayout.findMany({ where: { providerId }, select: { status: true, amount: true } }),
  ]);

  const sum = (fn: (p: (typeof payments)[number]) => number) => payments.reduce((a, p) => a + fn(p), 0);

  const grossSales = sum((p) => p.grossAmount);
  const providerNet = sum((p) => p.providerNet);

  // 30-day trailing platform volume drives the Premium saving estimate.
  const cutoff = new Date(Date.now() - 30 * 86_400_000);
  const trailingVolume = payments
    .filter((p) => p.succeededAt && p.succeededAt >= cutoff)
    .reduce((a, p) => a + p.grossAmount, 0);

  return {
    currency: provider.currency,
    grossSales,
    platformCommission: sum((p) => p.platformCommission),
    processorFees: sum((p) => p.processorFee),
    providerNet,
    refunded: sum((p) => p.refundedAmount),
    pendingPayout: payouts.filter((p) => p.status === "PENDING" || p.status === "IN_TRANSIT").reduce((a, p) => a + p.amount, 0),
    paidOut: payouts.filter((p) => p.status === "PAID").reduce((a, p) => a + p.amount, 0),
    currentPlan: provider.plan,
    currentCommissionRate: COMMISSION_RATE[provider.plan],
    estimatedPremiumMonthlySaving:
      provider.plan === "FREE" ? estimatePremiumCommissionSaving(trailingVolume) : 0,
  };
}
