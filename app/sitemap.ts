import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const staticRoutes = [
    "",
    "/search",
    "/categories",
    "/how-it-works",
    "/for-teachers",
    "/premium",
    "/faq",
    "/trust",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  const providers = await safeQuery(
    () =>
      prisma.provider.findMany({
        where: { published: true, moderationStatus: "APPROVED" },
        select: { id: true, updatedAt: true },
        take: 5000,
      }),
    [],
  );

  return [
    ...staticRoutes,
    ...providers.map((p) => ({ url: `${base}/providers/${p.id}`, lastModified: p.updatedAt })),
  ];
}
