import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import { studentBookings } from "@/lib/data/student";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import { bookingStatusLabel } from "@/lib/i18n/labels";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("studentBookings");
  return { title: t("metaTitle") };
}

const TABS = [
  { key: "upcoming", statuses: ["CONFIRMED", "PENDING_PAYMENT"] },
  { key: "completed", statuses: ["COMPLETED", "NO_SHOW"] },
  { key: "cancelled", statuses: ["CANCELLED", "REFUNDED"] },
] as const;

function statusTone(s: string) {
  if (s === "CONFIRMED" || s === "COMPLETED") return "success" as const;
  if (s === "PENDING_PAYMENT") return "yellow" as const;
  if (s === "CANCELLED" || s === "REFUNDED") return "danger" as const;
  return "neutral" as const;
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const t = await getTranslations("studentBookings");
  const st = await getTranslations("statusLabels");
  const locale = await getLocale();
  const loc = locale === "tr" ? "tr-TR" : "en-GB";
  const { tab } = await searchParams;
  const active = TABS.find((x) => x.key === tab) ?? TABS[0];
  const all = await studentBookings(user.id);
  const rows = all.filter((b) => (active.statuses as readonly string[]).includes(b.status));

  const tabLabel = (key: string) =>
    key === "upcoming" ? t("tabUpcoming") : key === "completed" ? t("tabCompleted") : t("tabCancelled");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">{t("title")}</h1>
      <div className="flex gap-2 border-b border-line-soft">
        {TABS.map((x) => (
          <Link
            key={x.key}
            href={`/bookings?tab=${x.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              x.key === active.key
                ? "border-brand-purple-600 font-medium text-brand-purple-700"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {tabLabel(x.key)}
          </Link>
        ))}
      </div>

      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((b) => (
            <li
              key={b.id}
              className="flex flex-col gap-3 rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{b.listing.title}</p>
                  <Badge tone={statusTone(b.status)}>{bookingStatusLabel(b.status, st)}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {b.provider.displayName}
                  {b.scheduledAt
                    ? ` · ${new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {formatMoney(b.grossAmount, b.currency)} ·{" "}
                  {t("paymentStatus", {
                    status: b.payment ? bookingStatusLabel(b.payment.status, st) : bookingStatusLabel("REQUIRES_PAYMENT", st),
                  })}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {b.status === "PENDING_PAYMENT" ? (
                  <Link
                    href={`/book/${b.listingId}`}
                    className="rounded-pill bg-brand-yellow-500 px-3 py-1.5 text-xs font-semibold"
                  >
                    {t("completePayment")}
                  </Link>
                ) : null}
                {(b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT") && (
                  <CancelBookingButton bookingId={b.id} />
                )}
                {b.status === "COMPLETED" || b.status === "CONFIRMED" ? (
                  <Link
                    href={`/providers/${b.provider.id}`}
                    className="rounded-pill border border-line-soft px-3 py-1.5 text-xs"
                  >
                    {t("bookAgain")}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          glyph="🗂️"
          title={t("noneTitle", { tab: tabLabel(active.key).toLowerCase() })}
          description={active.key === "upcoming" ? t("noneUpcomingBody") : t("noneOtherBody")}
          action={active.key === "upcoming" ? { label: t("findTeacher"), href: "/search" } : undefined}
        />
      )}
    </div>
  );
}
