import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { StatCard } from "@/components/ui/StatCard";
import { formatMoney } from "@/lib/money";
import { COMMISSION_RATE } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: t("metaTitle") };
}

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const t = await getTranslations("admin");
  const common = await getTranslations("common");
  const st = await getTranslations("statusLabels");

  const data = await safeQuery(
    async () => {
      const [users, providers, publishedProviders, bookings, gmv, commission, subs, complaints, pendingMod] =
        await Promise.all([
          prisma.user.count(),
          prisma.provider.count(),
          prisma.provider.count({ where: { published: true } }),
          prisma.booking.count({ where: { status: { in: ["CONFIRMED", "COMPLETED"] } } }),
          prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { grossAmount: true } }),
          prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { platformCommission: true } }),
          prisma.subscription.groupBy({ by: ["status"], _count: true }),
          prisma.complaint.count({ where: { status: "PENDING" } }),
          prisma.provider.count({ where: { moderationStatus: "PENDING", onboardingStep: { gte: 4 } } }),
        ]);
      return { users, providers, publishedProviders, bookings, gmv, commission, subs, complaints, pendingMod };
    },
    null,
  );

  if (!data) {
    return <p className="text-sm text-ink-secondary">{t("unavailable")}</p>;
  }

  const navItems = [
    [t("navProviders"), "/admin/providers"],
    [t("navBookings"), "/admin/bookings"],
    [t("navSubscriptions"), "/admin/subscriptions"],
    [t("navComplaints"), "/admin/complaints"],
  ] as const;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">{t("title")}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("users")} value={data.users} />
        <StatCard
          label={t("providers")}
          value={`${data.publishedProviders} / ${data.providers}`}
          hint={t("publishedTotal")}
        />
        <StatCard label={t("confirmedBookings")} value={data.bookings} tone="lavender" />
        <StatCard label={t("gmv")} value={formatMoney(data.gmv._sum.grossAmount ?? 0)} tone="yellow" />
        <StatCard
          label={t("platformCommission")}
          value={formatMoney(data.commission._sum.platformCommission ?? 0)}
        />
        <StatCard label={t("openComplaints")} value={data.complaints} />
        <StatCard label={t("awaitingModeration")} value={data.pendingMod} />
        <StatCard
          label={t("subscriptions")}
          value={data.subs.reduce((a, s) => a + s._count, 0)}
          hint={
            data.subs.map((s) => `${st(s.status)}: ${s._count}`).join(" · ") || t("none")
          }
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg">{t("commissionRulesTitle")}</h2>
        <table className="text-sm">
          <tbody>
            <tr className="border-b border-line-soft/60">
              <td className="py-1.5 pr-8 font-medium">{common("free")}</td>
              <td>{Math.round(COMMISSION_RATE.FREE * 100)}%</td>
            </tr>
            <tr>
              <td className="py-1.5 pr-8 font-medium">{common("premium")}</td>
              <td>{Math.round(COMMISSION_RATE.PREMIUM * 100)}%</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-ink-tertiary">{t("commissionRulesNote")}</p>
      </section>

      <nav className="flex flex-wrap gap-2">
        {navItems.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="rounded-pill border border-line-soft px-4 py-2 text-sm hover:bg-brand-lavender-100"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
