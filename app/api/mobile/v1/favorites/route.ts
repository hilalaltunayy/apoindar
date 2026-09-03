import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import { listFavorites, toggleFavorite } from "@/lib/services/favorites";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user }) => {
  const rows = await listFavorites(user!.id);
  return {
    favorites: rows.map((f) => ({
      id: f.provider.id,
      displayName: f.provider.displayName,
      headline: f.provider.headline,
      city: f.provider.city,
      district: f.provider.district,
      deliveryMode: f.provider.deliveryMode,
      photoUrl: f.provider.photoUrl,
      startingPrice: f.provider.startingPrice,
      currency: f.provider.currency,
      plan: f.provider.plan,
      promoted: !!f.provider.promotedUntil && f.provider.promotedUntil > new Date(),
      categories: f.provider.categories.map((c) => ({
        name: c.category.name,
        slug: c.category.slug,
      })),
      favoritedAt: f.createdAt.toISOString(),
    })),
  };
});

export const POST = route(
  { auth: true, body: z.object({ providerId: z.string().min(1) }) },
  async ({ user, body, req }) =>
    toggleFavorite(user!.id, body.providerId, req.headers.get("x-apoindar-platform") ?? "mobile"),
);
