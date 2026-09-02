import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { currentUser } from "@/lib/authz";
import { providerHome, providerDashboardData } from "@/lib/data/provider";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/brand/Reveal";
import { formatMoney } from "@/lib/money";
import { COMMISSION_RATE, PLAN_LIMITS } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("providerDash");
  return { title: t("metaTitle") };
}

export default async function ProviderDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/provider");
  if (user.role !== "PROVIDER") redirect("/dashboard");

  const t = await getTranslations("providerDash");
  const common = await getTranslations("common");
  const locale = await getLocale();
  const loc = locale === "tr" ? "tr-TR" : "en-GB";

  const { provider, plan, entitlements } = await providerHome();
  const d = await providerDashboardData(provider.id);
  const isPremium = plan === "PREMIUM";
  const rate = COMMISSION_RATE[plan];
  const next = d.upcoming[0];
  const planLabel = isPremium ? common("premium") : common("free");

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl">
              {t("todayGreeting", { name: provider.displayName.split(" ")[0] })}
            </h1>
            <p className="text-sm text-ink-secondary">
              {new Intl.DateTimeFormat(loc, {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </p>
          </div>
          <Badge tone={isPremium ? "purple" : "neutral"}>
            {t("planBadge", { plan: planLabel, rate: Math.round(rate * 100) })}
          </Badge>
        </div>
      </Reveal>

      <Reveal>
        <Card className="bg-gradient-to-br from-brand-yellow-100/80 to-brand-lavender-100/70">
          <h2 className="font-serif text-lg">{t("nextLessonTitle")}</h2>
          {next ? (
            <div className="mt-2">
              <p className="text-2xl font-semibold">
                {next.scheduledAt
                  ? new Intl.DateTimeFormat(loc, {
                      weekday: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(next.scheduledAt)
                  : t("timeToArrange")}
              </p>
              <p className="text-sm text-ink-secondary">
                {next.listing.title} · {next.studentUser?.name ?? common("student")}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-secondary">{t("noNextLesson")}</p>
          )}
          <div className="mt-4 flex gap-2">
            <Link
              href="/provider/calendar"
              className="rounded-pill bg-brand-purple-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {t("openCalendar")}
            </Link>
            <Link
              href="/provider/listings"
              className="rounded-pill border border-brand-purple-300 px-4 py-2 text-sm font-semibold text-brand-purple-700"
            >
              {t("lessonsAndPackages")}
            </Link>
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("todaysLessons")} value={d.todayLessons.length} tone="yellow" />
        <StatCard
          label={t("activeStudents")}
          value={
            Number.isFinite(entitlements.studentsMaxActive)
              ? `${d.activeStudents} / ${entitlements.studentsMaxActive}`
              : d.activeStudents
          }
          hint={
            !isPremium && d.activeStudents >= PLAN_LIMITS.FREE.activeStudents
              ? t("limitReached")
              : undefined
          }
        />
        <StatCard
          label={t("activeListings")}
          value={
            Number.isFinite(entitlements.listingsMaxActive)
              ? `${d.activeListings} / ${entitlements.listingsMaxActive}`
              : d.activeListings
          }
        />
        <StatCard
          label={t("netRevenue30")}
          tone="lavender"
          value={formatMoney(d.revenue30dNet, provider.currency)}
          hint={t("fromGross", { gross: formatMoney(d.revenue30dGross, provider.currency) })}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg">{t("upcomingBookings")}</h2>
          {d.upcoming.length ? (
            <div className="space-y-2">
              {d.upcoming.map((b) => (
                <Card key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{b.listing.title}</p>
                    <p className="text-xs text-ink-tertiary">
                      {b.studentUser?.name ?? common("student")}
                      {b.scheduledAt
                        ? ` · ${new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                        : ""}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState glyph="📆" title={t("noUpcomingTitle")} description={t("noUpcomingBody")} />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg">{t("recentPayments")}</h2>
          {d.recentPayments.length ? (
            <div className="space-y-2">
              {d.recentPayments.map((p) => (
                <Card key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{p.booking.listing.title}</p>
                    <p className="text-xs text-ink-tertiary">
                      {p.succeededAt
                        ? new Intl.DateTimeFormat(loc, { dateStyle: "medium" }).format(p.succeededAt)
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatMoney(p.providerNet, p.currency)}</p>
                    <p className="text-xs text-ink-tertiary">
                      {t("netOfFee", { fee: formatMoney(p.platformCommission, p.currency) })}
                    </p>
                  </div>
                </Card>
              ))}
              <Link
                href="/provider/earnings"
                className="text-sm text-brand-purple-700 hover:underline"
              >
                {t("fullEarnings")} →
              </Link>
            </div>
          ) : (
            <EmptyState glyph="💸" title={t("noPaymentsTitle")} description={t("noPaymentsBody")} />
          )}
        </section>
      </div>

      {!isPremium ? (
        <Reveal>
          <Card className="border-brand-purple-200 bg-brand-lavender-100/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg">{t("upsellTitle")}</h3>
                <p className="text-sm text-ink-secondary">{t("upsellBody")}</p>
              </div>
              <Link
                href="/premium"
                className="rounded-pill bg-brand-yellow-500 px-5 py-2.5 text-sm font-semibold"
              >
                {t("seePremium")}
              </Link>
            </div>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}
