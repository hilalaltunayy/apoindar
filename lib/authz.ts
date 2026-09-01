import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectivePlan } from "@/lib/domain/subscription";
import { entitlementsForPlan, type EntitlementSnapshot } from "@/lib/domain/entitlements";

export type Role = "STUDENT" | "PROVIDER" | "ADMIN";

export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly status = 403,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Page guard: redirect anonymous users to login. */
export async function requireUser(next?: string) {
  const user = await currentUser();
  if (!user) redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  return user;
}

/** Page guard: require a specific role. */
export async function requireRole(role: Role, next?: string) {
  const user = await requireUser(next);
  if (user.role !== role) redirect("/dashboard");
  return user;
}

/** API guard: throw instead of redirect. */
export async function assertRole(role: Role) {
  const user = await currentUser();
  if (!user) throw new AuthorizationError("Authentication required", 401);
  if (user.role !== role) throw new AuthorizationError(`Requires ${role} role`);
  return user;
}

/**
 * Resolve the provider record + a fresh server-side entitlement snapshot.
 * Entitlements are ALWAYS derived here from the DB subscription — never trusted
 * from the client (10 §19, 04 §7).
 */
export async function getProviderContext(userId: string) {
  const provider = await prisma.provider.findUnique({
    where: { userId },
    include: { subscription: true },
  });
  if (!provider) return null;

  const plan = provider.subscription
    ? effectivePlan({
        status: provider.subscription.status,
        trialEndsAt: provider.subscription.trialEndsAt,
        currentPeriodEnd: provider.subscription.currentPeriodEnd,
      })
    : "FREE";

  const entitlements: EntitlementSnapshot = entitlementsForPlan(plan);
  return { provider, plan, entitlements };
}

export async function requireProvider(next?: string) {
  const user = await requireRole("PROVIDER", next);
  const ctx = await getProviderContext(user.id);
  if (!ctx) redirect("/onboarding/provider");
  return { user, ...ctx };
}
