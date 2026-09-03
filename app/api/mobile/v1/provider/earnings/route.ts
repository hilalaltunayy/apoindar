import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { getEarningsSummary } from "@/lib/services/earnings";
import { PREMIUM_PRICE, PREMIUM_MONTHLY_BREAK_EVEN_VOLUME } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const provider = await prisma.provider.findUnique({
    where: { userId: user!.id },
    select: { id: true },
  });
  if (!provider) throw new ApiError(404, "no_provider");

  const [summary, payouts] = await Promise.all([
    getEarningsSummary(provider.id),
    prisma.providerPayout.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    summary,
    premiumMonthlyPrice: PREMIUM_PRICE.MONTH,
    premiumBreakEvenVolume: PREMIUM_MONTHLY_BREAK_EVEN_VOLUME,
    payouts: payouts.map((p) => ({
      id: p.id,
      status: p.status,
      amount: p.amount,
      currency: p.currency,
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString(),
      paidAt: p.paidAt?.toISOString() ?? null,
    })),
  };
});
