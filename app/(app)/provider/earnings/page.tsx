import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireProvider } from "@/lib/authz";
import { getEarningsSummary } from "@/lib/services/earnings";
import { safeQuery } from "@/lib/data/safe";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";
import { PREMIUM_PRICE, PREMIUM_MONTHLY_BREAK_EVEN_VOLUME } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("earnings");
  return { title: t("metaTitle") };
}

export default async function EarningsPage() {
  const t = await getTranslations("earnings");
  const common = await getTranslations("common");
  const { provider, plan } = await requireProvider();
  const s = await safeQuery(() => getEarningsSummary(provider.id), null);
  const planLabel = plan === "PREMIUM" ? common("premium") : common("free");

  if (!s || s.grossSales === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">{t("title")}</h1>
        <EmptyState
          glyph="💰"
          title={t("noneTitle")}
          description={t("noneBody")}
          action={{ label: t("addLesson"), href: "/provider/listings" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">
          {t("planLine", { plan: planLabel, rate: Math.round(s.currentCommissionRate * 100) })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("grossSales")} value={formatMoney(s.grossSales, s.currency)} tone="yellow" />
        <StatCard
          label={t("platformCommission")}
          value={`− ${formatMoney(s.platformCommission, s.currency)}`}
        />
        <StatCard
          label={t("paymentFees")}
          value={`− ${formatMoney(s.processorFees, s.currency)}`}
          hint={t("feesNote")}
        />
        <StatCard label={t("yourNet")} value={formatMoney(s.providerNet, s.currency)} tone="lavender" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("pendingPayout")} value={formatMoney(s.pendingPayout, s.currency)} />
        <StatCard label={t("paidOut")} value={formatMoney(s.paidOut, s.currency)} />
        <StatCard label={t("refunded")} value={formatMoney(s.refunded, s.currency)} />
      </div>

      {plan === "FREE" ? (
        <div className="rounded-xl border border-brand-purple-200 bg-brand-lavender-100/50 p-6">
          <h2 className="font-serif text-lg">{t("premiumTitle")}</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {t("premiumBody", {
              saving: formatMoney(s.estimatedPremiumMonthlySaving, s.currency),
              price: formatMoney(PREMIUM_PRICE.MONTH, s.currency),
              breakeven: formatMoney(PREMIUM_MONTHLY_BREAK_EVEN_VOLUME, s.currency),
            })}
          </p>
          <Link
            href="/premium"
            className="mt-4 inline-block rounded-pill bg-brand-yellow-500 px-5 py-2.5 text-sm font-semibold"
          >
            {t("comparePlans")}
          </Link>
        </div>
      ) : null}

      <p className="text-xs text-ink-tertiary">{t("payoutNote")}</p>
    </div>
  );
}
