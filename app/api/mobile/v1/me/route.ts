import { prisma } from "@/lib/prisma";
import { route } from "@/lib/mobile-api/handler";
import { resolveEntitlements } from "@/lib/services/provider";
import { COMMISSION_RATE } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user }) => {
  const base = {
    id: user!.id,
    name: user!.name,
    email: user!.email,
    role: user!.role,
    emailVerified: user!.emailVerified,
  };

  if (user!.role !== "PROVIDER") return { user: base, provider: null };

  const provider = await prisma.provider.findUnique({
    where: { userId: user!.id },
    select: {
      id: true,
      displayName: true,
      headline: true,
      city: true,
      district: true,
      photoUrl: true,
      published: true,
      onboardingStep: true,
      plan: true,
      currency: true,
    },
  });
  if (!provider) return { user: base, provider: null };

  const { plan, entitlements } = await resolveEntitlements(provider.id);
  return {
    user: base,
    provider: { ...provider, plan },
    entitlements: {
      ...entitlements,
      commissionRate: COMMISSION_RATE[plan],
    },
  };
});
