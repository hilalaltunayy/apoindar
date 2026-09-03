import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { getProviderProfile } from "@/lib/data/discovery";
import { logRecommendationEvent } from "@/lib/services/recommendation";
import { verifyMobileToken } from "@/lib/mobile-api/token";

export const dynamic = "force-dynamic";

export const GET = route({ auth: false }, async ({ params, req }) => {
  const p = await getProviderProfile((params.id as string));
  if (!p) throw new ApiError(404, "not_found");

  const auth = req.headers.get("authorization");
  let favorited = false;
  if (auth?.startsWith("Bearer ")) {
    const tok = verifyMobileToken(auth.slice(7));
    if (tok) {
      favorited = !!(await prisma.favorite.findUnique({
        where: { userId_providerId: { userId: tok.sub, providerId: p.id } },
      }));
      await logRecommendationEvent({
        userId: tok.sub,
        type: "PROFILE_OPEN",
        providerId: p.id,
        platform: req.headers.get("x-apoindar-platform") ?? "mobile",
      });
    }
  }

  return {
    id: p.id,
    displayName: p.displayName,
    headline: p.headline,
    bio: p.bio,
    city: p.city,
    district: p.district,
    deliveryMode: p.deliveryMode,
    photoUrl: p.photoUrl,
    startingPrice: p.startingPrice,
    currency: p.currency,
    yearsExperience: p.yearsExperience,
    languages: p.languages,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    plan: p.plan,
    promoted: !!p.promotedUntil && p.promotedUntil > new Date(),
    favorited,
    categories: p.categories.map((c) => ({ name: c.category.name, slug: c.category.slug })),
    listings: p.listings.map((l) => ({
      id: l.id,
      kind: l.kind,
      title: l.title,
      description: l.description,
      priceAmount: l.priceAmount,
      currency: l.currency,
      durationMin: l.durationMin,
      lessonCount: l.lessonCount,
      deliveryMode: l.deliveryMode,
      packageTerms: l.packageTerms,
    })),
    availability: p.availability.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
    })),
    lessonsBooked: p._count.bookings,
  };
});
