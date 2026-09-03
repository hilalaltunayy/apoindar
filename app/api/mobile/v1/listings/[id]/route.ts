import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";

export const dynamic = "force-dynamic";

/** Single listing + its provider + open slots — powers the mobile booking flow. */
export const GET = route({ auth: false }, async ({ params }) => {
  const listing = await prisma.listing.findFirst({
    where: { id: params.id as string, status: "ACTIVE", provider: { published: true } },
    include: {
      provider: {
        select: { id: true, displayName: true, photoUrl: true, city: true, currency: true, deliveryMode: true },
      },
      category: { select: { name: true, slug: true } },
    },
  });
  if (!listing) throw new ApiError(404, "not_found");

  const slots = await prisma.availabilitySlot.findMany({
    where: { providerId: listing.providerId, isBooked: false, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 30,
  });

  return {
    id: listing.id,
    kind: listing.kind,
    title: listing.title,
    description: listing.description,
    priceAmount: listing.priceAmount,
    currency: listing.currency,
    durationMin: listing.durationMin,
    lessonCount: listing.lessonCount,
    deliveryMode: listing.deliveryMode,
    packageTerms: listing.packageTerms,
    category: listing.category,
    provider: listing.provider,
    availability: slots.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
  };
});
