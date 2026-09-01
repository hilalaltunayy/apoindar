import "server-only";
import { prisma } from "@/lib/prisma";
import {
  startTrial,
  activatePaid,
  cancelAtPeriodEnd,
  priceForInterval,
  effectivePlan,
  type BillingInterval,
} from "@/lib/domain/subscription";
import { entitlementRows } from "@/lib/domain/entitlements";
import { AuthorizationError } from "@/lib/authz";

async function ownProvider(providerId: string, userId: string) {
  const p = await prisma.provider.findFirst({
    where: { id: providerId, userId },
    include: { subscription: true },
  });
  if (!p) throw new AuthorizationError("Provider not found");
  return p;
}

/** Persist the entitlement snapshot rows for a subscription's effective plan. */
async function syncEntitlements(subscriptionId: string, plan: "FREE" | "PREMIUM") {
  const rows = entitlementRows(plan);
  await prisma.$transaction([
    prisma.subscriptionEntitlement.deleteMany({ where: { subscriptionId } }),
    prisma.subscriptionEntitlement.createMany({
      data: rows.map((r) => ({ subscriptionId, key: r.key, value: r.value })),
    }),
  ]);
}

/** Start the 14-day, no-card trial (03 §5). One trial per provider (anti-abuse). */
export async function beginTrial(providerId: string, userId: string, interval: BillingInterval) {
  const provider = await ownProvider(providerId, userId);
  if (provider.subscription?.trialStartedAt) {
    throw new AuthorizationError("This account has already used its Premium trial.");
  }
  const t = startTrial();
  const sub = await prisma.subscription.upsert({
    where: { providerId },
    create: {
      providerId,
      status: "TRIALING",
      interval,
      priceAmount: priceForInterval(interval),
      trialStartedAt: t.trialStartedAt,
      trialEndsAt: t.trialEndsAt,
    },
    update: {
      status: "TRIALING",
      interval,
      trialStartedAt: t.trialStartedAt,
      trialEndsAt: t.trialEndsAt,
    },
  });
  await Promise.all([
    prisma.provider.update({ where: { id: providerId }, data: { plan: "PREMIUM" } }),
    syncEntitlements(sub.id, "PREMIUM"),
  ]);
  return sub;
}

/** Activate a paid subscription (mock billing in V1 — no real charge). */
export async function activateSubscription(
  providerId: string,
  userId: string,
  interval: BillingInterval,
) {
  await ownProvider(providerId, userId);
  const a = activatePaid(interval);
  const sub = await prisma.subscription.upsert({
    where: { providerId },
    create: { providerId, ...a },
    update: { ...a, cancelledAt: null },
  });
  await Promise.all([
    prisma.provider.update({ where: { id: providerId }, data: { plan: "PREMIUM" } }),
    syncEntitlements(sub.id, "PREMIUM"),
  ]);
  return sub;
}

/** Cancel → stays Premium until the paid period ends, then Free. Non-destructive (10 §11). */
export async function cancelSubscription(providerId: string, userId: string) {
  const provider = await ownProvider(providerId, userId);
  if (!provider.subscription) throw new AuthorizationError("No active subscription");
  const c = cancelAtPeriodEnd();
  const sub = await prisma.subscription.update({
    where: { providerId },
    data: c,
  });
  // Plan flips only when the period actually ends (reconciled by reconcilePlan).
  return sub;
}

/**
 * Idempotent reconciliation: bring provider.plan + entitlement rows in line with
 * the subscription's effective plan at `now`. Run on provider dashboard load and
 * (later) from a scheduled job. Trial expiry / period end downgrade lands here.
 */
export async function reconcilePlan(providerId: string, now = new Date()) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: { subscription: true },
  });
  if (!provider) return;

  const plan = provider.subscription
    ? effectivePlan(
        {
          status: provider.subscription.status,
          trialEndsAt: provider.subscription.trialEndsAt,
          currentPeriodEnd: provider.subscription.currentPeriodEnd,
        },
        now,
      )
    : "FREE";

  if (provider.subscription) {
    const sub = provider.subscription;
    const expired =
      plan === "FREE" &&
      (sub.status === "TRIALING" || sub.status === "ACTIVE" || sub.status === "CANCELLED");
    if (expired && sub.status !== "EXPIRED") {
      await prisma.subscription.update({
        where: { providerId },
        data: { status: "EXPIRED" },
      });
    }
    await syncEntitlements(sub.id, plan);
  }

  if (provider.plan !== plan) {
    await prisma.provider.update({ where: { id: providerId }, data: { plan } });
  }
  return plan;
}
