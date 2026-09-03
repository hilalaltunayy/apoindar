import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";

export const dynamic = "force-dynamic";

const schema = z.object({
  displayName: z.string().min(2).max(80),
  headline: z.string().max(140).optional(),
  bio: z.string().max(2000).optional(),
  categorySlugs: z.array(z.string()).min(1).max(5),
  city: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  deliveryMode: z.enum(["ONLINE", "IN_PERSON", "BOTH"]),
  yearsExperience: z.number().int().min(0).max(70).optional(),
  languages: z.array(z.enum(["tr", "en"])).max(5).optional(),
});

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await prisma.provider.findUnique({
    where: { userId: user!.id },
    include: {
      categories: { select: { category: { select: { slug: true } } } },
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });
  if (!p) throw new ApiError(404, "no_provider");
  return {
    provider: {
      displayName: p.displayName,
      headline: p.headline,
      bio: p.bio,
      city: p.city,
      district: p.district,
      deliveryMode: p.deliveryMode,
      yearsExperience: p.yearsExperience,
      languages: p.languages,
      published: p.published,
      onboardingStep: p.onboardingStep,
      categorySlugs: p.categories.map((c) => c.category.slug),
    },
    hasActiveListing: p._count.listings > 0,
  };
});

export const PUT = route({ auth: true, role: "PROVIDER", body: schema }, async ({ user, body }) => {
  const p = await prisma.provider.findUnique({ where: { userId: user!.id }, select: { id: true, onboardingStep: true } });
  if (!p) throw new ApiError(404, "no_provider");
  const cats = await prisma.educationCategory.findMany({
    where: { slug: { in: body.categorySlugs } },
    select: { id: true },
  });
  await prisma.$transaction([
    prisma.provider.update({
      where: { id: p.id },
      data: {
        displayName: body.displayName,
        headline: body.headline ?? null,
        bio: body.bio ?? null,
        city: body.city ?? null,
        district: body.district ?? null,
        deliveryMode: body.deliveryMode,
        yearsExperience: body.yearsExperience ?? null,
        languages: body.languages ?? [],
        onboardingStep: Math.max(p.onboardingStep, 4),
      },
    }),
    prisma.providerCategory.deleteMany({ where: { providerId: p.id } }),
    prisma.providerCategory.createMany({
      data: cats.map((c) => ({ providerId: p.id, categoryId: c.id })),
    }),
  ]);
  return { ok: true };
});

export const POST = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await prisma.provider.findUnique({ where: { userId: user!.id }, select: { id: true } });
  if (!p) throw new ApiError(404, "no_provider");
  const active = await prisma.listing.count({ where: { providerId: p.id, status: "ACTIVE" } });
  if (active < 1) throw new ApiError(422, "needs_listing");
  await prisma.provider.update({
    where: { id: p.id },
    data: { published: true, moderationStatus: "APPROVED", onboardingStep: 9 },
  });
  return { ok: true, published: true };
});
