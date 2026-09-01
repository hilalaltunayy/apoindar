import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/authz-admin";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Subscriptions" };

export default async function AdminSubscriptionsPage() {
  await requireAdmin();
  const subs = await safeQuery(
    () =>
      prisma.subscription.findMany({
        orderBy: { updatedAt: "desc" },
        include: { provider: { select: { displayName: true } }, entitlements: true },
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-brand-purple-700 hover:underline">
        ← Admin
      </Link>
      <h1 className="text-2xl">Subscriptions</h1>
      {subs.length ? (
        <ul className="space-y-3">
          {subs.map((s) => (
            <li key={s.id} className="rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{s.provider.displayName}</p>
                <Badge tone={s.status === "ACTIVE" || s.status === "TRIALING" ? "success" : "neutral"}>
                  {s.status.toLowerCase()}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">
                {s.interval === "MONTH" ? "Monthly" : "Annual"} · {formatMoney(s.priceAmount, s.currency)}
                {s.trialEndsAt ? ` · trial ends ${s.trialEndsAt.toISOString().slice(0, 10)}` : ""}
                {s.currentPeriodEnd ? ` · period ends ${s.currentPeriodEnd.toISOString().slice(0, 10)}` : ""}
                {s.cancelAtPeriodEnd ? " · cancels at period end" : ""}
              </p>
              <p className="mt-1 text-xs text-ink-tertiary">
                {s.entitlements.map((e) => `${e.key}=${e.value}`).join("  ·  ")}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="⭐" title="No subscriptions yet" />
      )}
    </div>
  );
}
