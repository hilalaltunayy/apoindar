import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { providerDashboardData } from "@/lib/data/provider";
import { resolveEntitlements } from "@/lib/services/provider";
import { reconcilePlan } from "@/lib/services/subscription";
import { COMMISSION_RATE } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const provider = await prisma.provider.findUnique({
    where: { userId: user!.id },
    select: { id: true, displayName: true, currency: true, published: true },
  });
  if (!provider) throw new ApiError(404, "no_provider");

  await reconcilePlan(provider.id).catch(() => undefined);
  const [{ plan, entitlements }, d] = await Promise.all([
    resolveEntitlements(provider.id),
    providerDashboardData(provider.id),
  ]);

  return {
    provider: { ...provider, plan },
    entitlements: { ...entitlements, commissionRate: COMMISSION_RATE[plan] },
    today: {
      lessons: d.todayLessons.length,
      activeStudents: d.activeStudents,
      activeListings: d.activeListings,
      revenue30dNet: d.revenue30dNet,
      revenue30dGross: d.revenue30dGross,
    },
    upcoming: d.upcoming.map((b) => ({
      id: b.id,
      title: b.listing.title,
      studentName: b.studentUser?.name ?? null,
      scheduledAt: b.scheduledAt?.toISOString() ?? null,
    })),
    recentPayments: d.recentPayments.map((p) => ({
      id: p.id,
      title: p.booking.listing.title,
      providerNet: p.providerNet,
      platformCommission: p.platformCommission,
      currency: p.currency,
      succeededAt: p.succeededAt?.toISOString() ?? null,
    })),
  };
});
