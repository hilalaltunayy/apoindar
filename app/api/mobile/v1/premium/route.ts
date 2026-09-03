import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { beginTrial, activateSubscription, cancelSubscription } from "@/lib/services/subscription";
import { resolveEntitlements } from "@/lib/services/provider";
import { AuthorizationError } from "@/lib/authz";
import {
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
  COMMISSION_RATE,
  PREMIUM_MONTHLY_BREAK_EVEN_VOLUME,
} from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

async function myProvider(userId: string) {
  const p = await prisma.provider.findUnique({
    where: { userId },
    include: { subscription: true },
  });
  if (!p) throw new ApiError(404, "no_provider");
  return p;
}

/** Premium state + the centralized rules the mobile UI renders (12 §16). */
export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await myProvider(user!.id);
  const { plan, entitlements } = await resolveEntitlements(p.id);
  return {
    plan,
    entitlements,
    subscription: p.subscription
      ? {
          status: p.subscription.status,
          interval: p.subscription.interval,
          trialEndsAt: p.subscription.trialEndsAt?.toISOString() ?? null,
          currentPeriodEnd: p.subscription.currentPeriodEnd?.toISOString() ?? null,
          cancelAtPeriodEnd: p.subscription.cancelAtPeriodEnd,
        }
      : null,
    pricing: {
      monthly: PREMIUM_PRICE.MONTH,
      yearly: PREMIUM_PRICE.YEAR,
      trialDays: PREMIUM_TRIAL_DAYS,
      freeCommission: COMMISSION_RATE.FREE,
      premiumCommission: COMMISSION_RATE.PREMIUM,
      breakEvenVolume: PREMIUM_MONTHLY_BREAK_EVEN_VOLUME,
    },
    // NOTE: RevenueCat is a later dedicated phase (12 §18). This endpoint drives
    // the entitlement UI only; it does not move money.
    billingProvider: "none",
  };
});

export const POST = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      action: z.enum(["trial", "subscribe", "cancel"]),
      interval: z.enum(["MONTH", "YEAR"]).optional(),
    }),
  },
  async ({ user, body }) => {
    const p = await myProvider(user!.id);
    try {
      if (body.action === "cancel") {
        await cancelSubscription(p.id, user!.id);
      } else if (body.action === "trial") {
        await beginTrial(p.id, user!.id, body.interval ?? "MONTH");
      } else {
        await activateSubscription(p.id, user!.id, body.interval ?? "MONTH");
      }
      return { ok: true };
    } catch (err) {
      if (err instanceof AuthorizationError) throw new ApiError(403, err.code ?? "forbidden", err.message);
      throw err;
    }
  },
);
