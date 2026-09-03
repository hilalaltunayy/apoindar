import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route } from "@/lib/mobile-api/handler";
import { resolveEntitlements } from "@/lib/services/provider";
import { COMMISSION_RATE } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export const PATCH = route(
  { auth: true, body: z.object({ name: z.string().min(2).max(80) }) },
  async ({ user, body }) => {
    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: { name: body.name.trim() },
      select: { id: true, name: true, email: true, role: true, emailVerified: true },
    });
    return { user: { ...updated, emailVerified: !!updated.emailVerified } };
  },
);

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
