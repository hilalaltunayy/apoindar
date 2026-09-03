import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import { searchProviders } from "@/lib/data/discovery";
import { favoriteProviderIds } from "@/lib/services/favorites";
import { logRecommendationEvent } from "@/lib/services/recommendation";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  mode: z.enum(["ONLINE", "IN_PERSON"]).optional(),
  language: z.string().optional(),
  minRating: z.coerce.number().optional(),
  minExperience: z.coerce.number().optional(),
  listingKind: z.enum(["SINGLE_LESSON", "PACKAGE"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["relevance", "price_asc", "price_desc", "rating"]).optional(),
  page: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});

export const GET = route({ auth: false, body: querySchema }, async ({ body, req }) => {
  const result = await searchProviders({
    q: body.q,
    city: body.city,
    categorySlug: body.category,
    mode: body.mode,
    language: body.language,
    minRating: body.minRating,
    minExperience: body.minExperience,
    listingKind: body.listingKind,
    minPrice: body.minPrice,
    maxPrice: body.maxPrice,
    sort: body.sort,
    page: body.page,
    pageSize: body.pageSize,
  });

  // Recommendation signal for authenticated searchers (12 §8).
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ") && (body.q || body.category || body.city)) {
    const { verifyMobileToken } = await import("@/lib/mobile-api/token");
    const p = verifyMobileToken(auth.slice(7));
    if (p) {
      await logRecommendationEvent({
        userId: p.sub,
        type: body.category ? "CATEGORY_VIEW" : "SEARCH",
        query: body.q ?? null,
        categorySlug: body.category ?? null,
        city: body.city ?? null,
        platform: req.headers.get("x-apoindar-platform") ?? "mobile",
      });
    }
  }

  let favoriteIds = new Set<string>();
  if (auth?.startsWith("Bearer ")) {
    const { verifyMobileToken } = await import("@/lib/mobile-api/token");
    const p = verifyMobileToken(auth.slice(7));
    if (p) favoriteIds = await favoriteProviderIds(p.sub);
  }

  return {
    ...result,
    results: result.results.map((r) => ({ ...r, favorited: favoriteIds.has(r.id) })),
  };
});
