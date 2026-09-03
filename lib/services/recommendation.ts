import "server-only";
import { prisma } from "@/lib/prisma";
import type { RecommendationEventType } from "@/lib/generated/prisma";

export type { RecommendationEventType };

export interface RecommendationSignal {
  userId: string;
  type: RecommendationEventType;
  providerId?: string | null;
  categorySlug?: string | null;
  city?: string | null;
  query?: string | null;
  metadata?: Record<string, unknown> | null;
  platform?: string | null;
}

/**
 * Append a recommendation signal (12 §8). Fire-and-forget: a logging failure
 * must never break the user flow. NOT consumed by ranking yet — this is only a
 * clean domain boundary so the data exists for a future recommender.
 */
export async function logRecommendationEvent(signal: RecommendationSignal): Promise<void> {
  try {
    await prisma.recommendationEvent.create({
      data: {
        userId: signal.userId,
        type: signal.type,
        providerId: signal.providerId ?? null,
        categorySlug: signal.categorySlug ?? null,
        city: signal.city ?? null,
        query: signal.query ?? null,
        metadata: (signal.metadata ?? undefined) as never,
        platform: signal.platform ?? null,
      },
    });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[recommendation] log failed:", (err as Error).message);
    }
  }
}
