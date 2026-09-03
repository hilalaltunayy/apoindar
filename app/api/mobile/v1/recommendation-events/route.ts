import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import { logRecommendationEvent } from "@/lib/services/recommendation";

export const dynamic = "force-dynamic";

const schema = z.object({
  type: z.enum([
    "SWIPE_INTERESTED",
    "SWIPE_SKIP",
    "FAVORITE_ADD",
    "FAVORITE_REMOVE",
    "PROFILE_OPEN",
    "SEARCH",
    "CATEGORY_VIEW",
    "CITY_VIEW",
    "BOOKING_CREATED",
    "PACKAGE_PURCHASED",
  ]),
  providerId: z.string().optional(),
  categorySlug: z.string().optional(),
  city: z.string().optional(),
  query: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/** Batch-friendly single endpoint for swipe/skip/etc. signals from the app (12 §8). */
export const POST = route({ auth: true, body: schema }, async ({ user, body, req }) => {
  await logRecommendationEvent({
    userId: user!.id,
    type: body.type,
    providerId: body.providerId ?? null,
    categorySlug: body.categorySlug ?? null,
    city: body.city ?? null,
    query: body.query ?? null,
    metadata: body.metadata ?? null,
    platform: req.headers.get("x-apoindar-platform") ?? "mobile",
  });
  return { ok: true };
});
