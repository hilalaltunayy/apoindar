import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { requireProvider } from "@/lib/authz";
import { providerBookings } from "@/lib/data/provider";
import { BookingRow } from "@/components/provider/BookingRow";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("nav");
  return { title: t("bookings") };
}

export default async function ProviderBookingsPage() {
  const t = await getTranslations("providerDash");
  const nav = await getTranslations("nav");
  const { provider } = await requireProvider();
  const bookings = await providerBookings(provider.id);
  const payments = await safeQuery(
    () =>
      prisma.payment.findMany({
        where: { booking: { providerId: provider.id } },
        select: { id: true, bookingId: true, grossAmount: true, refundedAmount: true, status: true },
      }),
    [] as { id: string; bookingId: string; grossAmount: number; refundedAmount: number; status: string }[],
  );
  const payByBooking = new Map(payments.map((p) => [p.bookingId, p]));

  if (!bookings.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">{nav("bookings")}</h1>
        <EmptyState glyph="📆" title={t("noUpcomingTitle")} description={t("noUpcomingBody")} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">{nav("bookings")}</h1>
      <ul className="space-y-3">
        {bookings.map((b) => {
          const pay = payByBooking.get(b.id);
          return (
            <BookingRow
              key={b.id}
              id={b.id}
              paymentId={pay?.id}
              title={b.listing.title}
              studentName={b.studentUser?.name ?? ""}
              studentEmail={b.studentUser?.email ?? undefined}
              scheduledAt={b.scheduledAt?.toISOString()}
              status={b.status}
              gross={b.grossAmount}
              currency={b.currency}
              paymentStatus={b.payment?.status}
              providerNet={b.payment?.providerNet}
              commission={b.payment?.platformCommission}
              refundable={pay ? pay.grossAmount - pay.refundedAmount : 0}
            />
          );
        })}
      </ul>
    </div>
  );
}
