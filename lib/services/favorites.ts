import "server-only";
import { prisma } from "@/lib/prisma";
import { logRecommendationEvent } from "@/lib/services/recommendation";

/** Toggle a provider favorite for a user. Backend-persisted (12 §11). */
export async function toggleFavorite(
  userId: string,
  providerId: string,
  platform?: string,
): Promise<{ favorited: boolean }> {
  const existing = await prisma.favorite.findUnique({
    where: { userId_providerId: { userId, providerId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await logRecommendationEvent({ userId, type: "FAVORITE_REMOVE", providerId, platform });
    return { favorited: false };
  }
  await prisma.favorite.create({ data: { userId, providerId } });
  await logRecommendationEvent({ userId, type: "FAVORITE_ADD", providerId, platform });
  return { favorited: true };
}

export async function listFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      provider: {
        select: {
          id: true,
          displayName: true,
          headline: true,
          city: true,
          district: true,
          deliveryMode: true,
          photoUrl: true,
          startingPrice: true,
          currency: true,
          plan: true,
          promotedUntil: true,
          categories: { select: { category: { select: { name: true, slug: true } } } },
        },
      },
    },
  });
}

export async function favoriteProviderIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.favorite.findMany({ where: { userId }, select: { providerId: true } });
  return new Set(rows.map((r) => r.providerId));
}
