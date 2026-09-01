import type { Metadata } from "next";
import Link from "next/link";
import { requireProvider } from "@/lib/authz";
import { getEarningsSummary } from "@/lib/services/earnings";
import { safeQuery } from "@/lib/data/safe";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";
import { PREMIUM_PRICE, PREMIUM_MONTHLY_BREAK_EVEN_VOLUME } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const { provider, plan } = await requireProvider();
  const s = await safeQuery(() => getEarningsSummary(provider.id), null);

  if (!s || s.grossSales === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">Earnings &amp; payouts</h1>
        <EmptyState
          glyph="💰"
          title="No earnings yet"
          description="Once students pay for lessons, your gross sales, commission and payouts appear here."
          action={{ label: "Add a lesson", href: "/provider/listings" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">Earnings &amp; payouts</h1>
        <p className="text-sm text-ink-secondary">
          Current plan: <strong>{plan}</strong> · commission {Math.round(s.currentCommissionRate * 100)}%
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross sales" value={formatMoney(s.grossSales, s.currency)} tone="yellow" />
        <StatCard
          label="Platform commission"
          value={`− ${formatMoney(s.platformCommission, s.currency)}`}
        />
        <StatCard
          label="Payment fees"
          value={`− ${formatMoney(s.processorFees, s.currency)}`}
          hint="processor cost, separate from commission"
        />
        <StatCard label="Your net" value={formatMoney(s.providerNet, s.currency)} tone="lavender" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending payout" value={formatMoney(s.pendingPayout, s.currency)} />
        <StatCard label="Paid out" value={formatMoney(s.paidOut, s.currency)} />
        <StatCard label="Refunded" value={formatMoney(s.refunded, s.currency)} />
      </div>

      {plan === "FREE" ? (
        <div className="rounded-xl border border-brand-purple-200 bg-brand-lavender-100/50 p-6">
          <h2 className="font-serif text-lg">Could Premium pay for itself?</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Premium cuts commission from 12% to 7%. On your last 30 days of platform
            volume, you’d have saved about{" "}
            <strong>{formatMoney(s.estimatedPremiumMonthlySaving, s.currency)}</strong> in
            commission — against a {formatMoney(PREMIUM_PRICE.MONTH, s.currency)}/month
            Premium price. The break-even point is around{" "}
            {formatMoney(PREMIUM_MONTHLY_BREAK_EVEN_VOLUME, s.currency)} of monthly volume.
          </p>
          <Link
            href="/premium"
            className="mt-4 inline-block rounded-pill bg-brand-yellow-500 px-5 py-2.5 text-sm font-semibold"
          >
            Compare Free &amp; Premium
          </Link>
        </div>
      ) : null}

      <p className="text-xs text-ink-tertiary">
        Payout scheduling and provider settlement accounts are finalised with the production
        payment provider (not activated in this environment).
      </p>
    </div>
  );
}
