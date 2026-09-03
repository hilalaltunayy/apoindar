import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { ACTIVE_BOOKING_STATUSES } from "@/lib/domain/booking-state";

export interface ProviderCardData {
  id: string;
  displayName: string;
  headline: string | null;
  city: string | null;
  district: string | null;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  photoUrl: string | null;
  startingPrice: number | null;
  currency: string;
  categories: { name: string; slug: string }[];
  plan: "FREE" | "PREMIUM";
  languages: string[];
  ratingAvg: number | null;
  ratingCount: number;
  yearsExperience: number | null;
  /** Paid-promotion marker (12 §9). Always false until promotion is enabled. */
  promoted: boolean;
}

const cardSelect = {
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
  languages: true,
  ratingAvg: true,
  ratingCount: true,
  yearsExperience: true,
  promotedUntil: true,
  categories: { select: { category: { select: { name: true, slug: true } } } },
} as const;

type CardRow = {
  id: string;
  displayName: string;
  headline: string | null;
  city: string | null;
  district: string | null;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  photoUrl: string | null;
  startingPrice: number | null;
  currency: string;
  plan: "FREE" | "PREMIUM";
  languages: string[];
  ratingAvg: number | null;
  ratingCount: number;
  yearsExperience: number | null;
  promotedUntil: Date | null;
  categories: { category: { name: string; slug: string } }[];
};

function toCard(row: CardRow): ProviderCardData {
  const { promotedUntil, categories, ...rest } = row;
  return {
    ...rest,
    categories: categories.map((c) => c.category),
    promoted: !!promotedUntil && promotedUntil > new Date(),
  };
}

/**
 * Search / filter contract (12 §10). `q`, `categorySlug`, `city` are live;
 * the rest are architected — some already query, some are accepted no-ops until
 * the supporting data (reviews, availability index) lands.
 */
export interface SearchParams {
  q?: string;
  city?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  mode?: "ONLINE" | "IN_PERSON";
  language?: string; // ISO code
  minRating?: number;
  minExperience?: number;
  listingKind?: "SINGLE_LESSON" | "PACKAGE";
  sort?: "relevance" | "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}

const PAGE_SIZE = 12;

export interface SearchResult {
  results: ProviderCardData[];
  total: number;
  page: number;
  pageSize: number;
  /** Kept separate so promoted placement can be layered in later (12 §9). */
  promotedIds: string[];
}

export async function searchProviders(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? PAGE_SIZE));

  return safeQuery(
    async () => {
      const where: Record<string, unknown> = { published: true, moderationStatus: "APPROVED" };

      if (params.city && params.city.toLowerCase() !== "online" && params.city.toLowerCase() !== "online") {
        where.city = { equals: params.city, mode: "insensitive" };
      }
      if (params.mode === "ONLINE") where.deliveryMode = { in: ["ONLINE", "BOTH"] };
      if (params.mode === "IN_PERSON") where.deliveryMode = { in: ["IN_PERSON", "BOTH"] };
      if (params.language) where.languages = { has: params.language.toLowerCase() };
      if (params.minRating != null) where.ratingAvg = { gte: params.minRating };
      if (params.minExperience != null) where.yearsExperience = { gte: params.minExperience };
      if (params.q) {
        where.OR = [
          { displayName: { contains: params.q, mode: "insensitive" } },
          { headline: { contains: params.q, mode: "insensitive" } },
          { bio: { contains: params.q, mode: "insensitive" } },
          { categories: { some: { category: { name: { contains: params.q, mode: "insensitive" } } } } },
        ];
      }
      if (params.categorySlug) {
        where.categories = { some: { category: { slug: params.categorySlug } } };
      }
      if (params.minPrice != null || params.maxPrice != null) {
        where.startingPrice = {
          ...(params.minPrice != null ? { gte: params.minPrice } : {}),
          ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
        };
      }
      if (params.listingKind) {
        where.listings = { some: { status: "ACTIVE", kind: params.listingKind } };
      }

      // Ranking. Promoted providers would be prepended here in a future step; for
      // now everything is organic and promoted providers just sort first among
      // equals via `promotedUntil`.
      const orderBy =
        params.sort === "price_asc"
          ? [{ startingPrice: "asc" as const }]
          : params.sort === "price_desc"
            ? [{ startingPrice: "desc" as const }]
            : params.sort === "rating"
              ? [{ ratingAvg: "desc" as const }, { ratingCount: "desc" as const }]
              : // relevance: promoted → Premium nudge → freshness (Free stays discoverable, 10 §13)
                [
                  { promotedUntil: "desc" as const },
                  { plan: "desc" as const },
                  { updatedAt: "desc" as const },
                ];

      const [rows, total] = await Promise.all([
        prisma.provider.findMany({
          where,
          select: cardSelect,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.provider.count({ where }),
      ]);

      const results = rows.map(toCard);
      return {
        results,
        total,
        page,
        pageSize,
        promotedIds: results.filter((r) => r.promoted).map((r) => r.id),
      };
    },
    { results: [], total: 0, page, pageSize, promotedIds: [] },
  );
}

export async function featuredProviders(limit = 6): Promise<ProviderCardData[]> {
  return safeQuery(async () => {
    const rows = await prisma.provider.findMany({
      where: { published: true, moderationStatus: "APPROVED" },
      select: cardSelect,
      orderBy: [{ promotedUntil: "desc" }, { plan: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });
    return rows.map(toCard);
  }, []);
}

export async function getProviderProfile(id: string) {
  return safeQuery(
    () =>
      prisma.provider.findFirst({
        where: { id, published: true },
        include: {
          categories: { include: { category: true } },
          listings: { where: { status: "ACTIVE" }, orderBy: { priceAmount: "asc" } },
          availability: {
            where: { isBooked: false, startsAt: { gte: new Date() } },
            orderBy: { startsAt: "asc" },
            take: 20,
          },
          _count: { select: { bookings: { where: { status: { in: ACTIVE_BOOKING_STATUSES } } } } },
        },
      }),
    null,
  );
}

export async function listCategories() {
  return safeQuery(
    () =>
      prisma.educationCategory.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    [],
  );
}
