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
  categories: string[];
  plan: "FREE" | "PREMIUM";
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
  categories: { select: { category: { select: { name: true } } } },
} as const;

function toCard(row: {
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
  categories: { category: { name: string } }[];
}): ProviderCardData {
  return {
    ...row,
    categories: row.categories.map((c) => c.category.name),
  };
}

export interface SearchParams {
  q?: string;
  city?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  mode?: "ONLINE" | "IN_PERSON";
  sort?: "relevance" | "price_asc" | "price_desc";
  page?: number;
}

const PAGE_SIZE = 12;

export async function searchProviders(params: SearchParams): Promise<{
  results: ProviderCardData[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(
    async () => {
      const where: Record<string, unknown> = {
        published: true,
        moderationStatus: "APPROVED",
      };
      if (params.city && params.city.toLowerCase() !== "online") {
        where.city = { equals: params.city, mode: "insensitive" };
      }
      if (params.mode === "ONLINE") where.deliveryMode = { in: ["ONLINE", "BOTH"] };
      if (params.mode === "IN_PERSON") where.deliveryMode = { in: ["IN_PERSON", "BOTH"] };
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

      const orderBy =
        params.sort === "price_asc"
          ? [{ startingPrice: "asc" as const }]
          : params.sort === "price_desc"
            ? [{ startingPrice: "desc" as const }]
            : // relevance: Premium gets a *controlled* nudge only, Free stays discoverable (10 §13)
              [{ plan: "desc" as const }, { updatedAt: "desc" as const }];

      const [rows, total] = await Promise.all([
        prisma.provider.findMany({
          where,
          select: cardSelect,
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
        prisma.provider.count({ where }),
      ]);

      return { results: rows.map(toCard), total, page, pageSize: PAGE_SIZE };
    },
    { results: [], total: 0, page, pageSize: PAGE_SIZE },
  );
}

export async function featuredProviders(limit = 6): Promise<ProviderCardData[]> {
  return safeQuery(async () => {
    const rows = await prisma.provider.findMany({
      where: { published: true, moderationStatus: "APPROVED" },
      select: cardSelect,
      orderBy: [{ plan: "desc" }, { updatedAt: "desc" }],
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
