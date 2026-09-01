import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { studentBookings } from "@/lib/data/student";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My bookings" };

const TABS = [
  { key: "upcoming", label: "Upcoming", statuses: ["CONFIRMED", "PENDING_PAYMENT"] },
  { key: "completed", label: "Completed", statuses: ["COMPLETED", "NO_SHOW"] },
  { key: "cancelled", label: "Cancelled", statuses: ["CANCELLED", "REFUNDED"] },
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
  const { tab } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];
  const all = await studentBookings(user.id);
  const rows = all.filter((b) => (active.statuses as readonly string[]).includes(b.status));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">My bookings</h1>
      <div className="flex gap-2 border-b border-line-soft">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/bookings?tab=${t.key}`}
            className={`-mb-px border-b-2 px-3 py-2 text-sm ${
              t.key === active.key
                ? "border-brand-purple-600 font-medium text-brand-purple-700"
                : "border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            {t.label}
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
                  <Badge tone={statusTone(b.status)}>{b.status.replace("_", " ").toLowerCase()}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {b.provider.displayName}
                  {b.scheduledAt
                    ? ` · ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                    : ""}
                </p>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {formatMoney(b.grossAmount, b.currency)} · payment {b.payment?.status.toLowerCase() ?? "pending"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {b.status === "PENDING_PAYMENT" ? (
                  <Link
                    href={`/book/${b.listingId}`}
                    className="rounded-pill bg-brand-yellow-500 px-3 py-1.5 text-xs font-semibold"
                  >
                    Complete payment
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
                    Book again
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          glyph="🗂️"
          title={`No ${active.label.toLowerCase()} bookings`}
          description={
            active.key === "upcoming"
              ? "When you book a lesson it will show up here."
              : "Nothing here yet."
          }
          action={active.key === "upcoming" ? { label: "Find a teacher", href: "/search" } : undefined}
        />
      )}
    </div>
  );
}
