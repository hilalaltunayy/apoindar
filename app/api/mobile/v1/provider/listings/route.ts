import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { providerListings } from "@/lib/data/provider";
import { createListing, setListingActive, resolveEntitlements } from "@/lib/services/provider";
import { AuthorizationError } from "@/lib/authz";

export const dynamic = "force-dynamic";

async function myProvider(userId: string) {
  const p = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  if (!p) throw new ApiError(404, "no_provider");
  return p;
}

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await myProvider(user!.id);
  const [rows, { entitlements }] = await Promise.all([
    providerListings(p.id),
    resolveEntitlements(p.id),
  ]);
  const activeCount = rows.filter((l) => l.status === "ACTIVE").length;
  return {
    entitlements,
    canActivateMore: activeCount < entitlements.listingsMaxActive,
    listings: rows.map((l) => ({
      id: l.id,
      title: l.title,
      kind: l.kind,
      status: l.status,
      priceAmount: l.priceAmount,
      currency: l.currency,
      durationMin: l.durationMin,
      lessonCount: l.lessonCount,
      bookings: l._count.bookings,
    })),
  };
});

export const POST = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      kind: z.enum(["SINGLE_LESSON", "PACKAGE"]),
      title: z.string().min(3).max(120),
      description: z.string().max(2000).optional(),
      priceAmount: z.number().int().positive(),
      durationMin: z.number().int().min(15).max(480),
      lessonCount: z.number().int().min(1).max(100),
      deliveryMode: z.enum(["ONLINE", "IN_PERSON", "BOTH"]),
      categorySlug: z.string().optional(),
      packageTerms: z.string().max(1000).optional(),
      activate: z.boolean().optional(),
    }),
  },
  async ({ user, body }) => {
    const p = await myProvider(user!.id);
    try {
      const l = await createListing(p.id, user!.id, body, body.activate ?? false);
      return { id: l.id, status: l.status };
    } catch (err) {
      if (err instanceof AuthorizationError) {
        throw new ApiError(403, err.code ?? "forbidden", err.message);
      }
      throw err;
    }
  },
);

export const PATCH = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({ listingId: z.string().min(1), active: z.boolean() }),
  },
  async ({ user, body }) => {
    try {
      const l = await setListingActive(body.listingId, user!.id, body.active);
      return { id: l.id, status: l.status };
    } catch (err) {
      if (err instanceof AuthorizationError) {
        throw new ApiError(403, err.code ?? "forbidden", err.message);
      }
      throw err;
    }
  },
);
