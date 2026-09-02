import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/authz-admin";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";
import { statusLabel } from "@/lib/i18n/labels";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return { title: `${t("metaTitle")} · ${t("navBookings")}` };
}

export default async function AdminBookingsPage() {
  await requireAdmin();
  const t = await getTranslations("admin");
  const common = await getTranslations("common");
  const st = await getTranslations("statusLabels");
  const bookings = await safeQuery(
    () =>
      prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          provider: { select: { displayName: true, plan: true } },
          listing: { select: { title: true } },
          studentUser: { select: { email: true } },
          payment: { include: { refunds: true } },
        },
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <Link href="/admin" className="text-sm text-brand-purple-700 hover:underline">
        ← {t("backToAdmin")}
      </Link>
      <h1 className="text-2xl">{t("navBookings")}</h1>
      {bookings.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line-soft text-left text-ink-tertiary">
              <tr>
                <th className="py-2 pr-4">{t("colRef")}</th>
                <th className="py-2 pr-4">{t("providers")}</th>
                <th className="py-2 pr-4">{t("colListing")}</th>
                <th className="py-2 pr-4">{t("colBooking")}</th>
                <th className="py-2 pr-4">{t("colPayment")}</th>
                <th className="py-2 pr-4">{t("colGross")}</th>
                <th className="py-2 pr-4">{t("colCommission")}</th>
                <th className="py-2 pr-4">{t("colRate")}</th>
                <th className="py-2">{t("colNet")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-line-soft/60">
                  <td className="py-2 pr-4 font-mono text-xs">{b.reference.slice(0, 8)}</td>
                  <td className="py-2 pr-4">
                    {b.provider.displayName}{" "}
                    <Badge tone={b.provider.plan === "PREMIUM" ? "purple" : "neutral"}>
                      {b.provider.plan === "PREMIUM" ? common("premium") : common("free")}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{b.listing.title}</td>
                  <td className="py-2 pr-4">
                    <Badge
                      tone={
                        b.status === "CONFIRMED" || b.status === "COMPLETED"
                          ? "success"
                          : b.status === "REFUNDED" || b.status === "CANCELLED"
                            ? "danger"
                            : "yellow"
                      }
                    >
                      {statusLabel(b.status, st)}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">
                    {b.payment ? statusLabel(b.payment.status, st) : "—"}
                  </td>
                  <td className="py-2 pr-4">{formatMoney(b.grossAmount, b.currency)}</td>
                  <td className="py-2 pr-4">
                    {b.payment ? formatMoney(b.payment.platformCommission, b.currency) : "—"}
                  </td>
                  <td className="py-2 pr-4">
                    {b.payment ? `${Math.round(b.payment.commissionRate * 100)}%` : "—"}
                  </td>
                  <td className="py-2">
                    {b.payment ? formatMoney(b.payment.providerNet, b.currency) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState glyph="🧾" title={t("noBookings")} />
      )}
    </div>
  );
}
