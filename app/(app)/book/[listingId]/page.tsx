import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { requireUser } from "@/lib/authz";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { DEFAULT_CANCELLATION_POLICY } from "@/lib/services/booking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book a lesson" };

export default async function BookPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const user = await requireUser(`/book/${listingId}`);
  if (user.role === "PROVIDER") redirect("/provider");

  const listing = await safeQuery(
    () =>
      prisma.listing.findFirst({
        where: { id: listingId, status: "ACTIVE" },
        include: {
          provider: {
            select: {
              id: true,
              displayName: true,
              availability: {
                where: { isBooked: false, startsAt: { gte: new Date() } },
                orderBy: { startsAt: "asc" },
                take: 18,
              },
            },
          },
        },
      }),
    null,
  );

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl">Book with {listing.provider.displayName}</h1>
      <p className="mb-6 text-sm text-ink-secondary">{listing.title}</p>
      <BookingWizard
        listing={{
          id: listing.id,
          title: listing.title,
          kind: listing.kind,
          priceAmount: listing.priceAmount,
          currency: listing.currency,
          durationMin: listing.durationMin,
          lessonCount: listing.lessonCount,
        }}
        providerName={listing.provider.displayName}
        slots={listing.provider.availability.map((s) => ({
          id: s.id,
          startsAt: s.startsAt.toISOString(),
        }))}
        cancellationPolicy={DEFAULT_CANCELLATION_POLICY}
      />
    </div>
  );
}
