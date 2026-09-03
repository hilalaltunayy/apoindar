import { prisma } from "@/lib/prisma";
import { route } from "@/lib/mobile-api/handler";
import { remainingCredits, packageProgress } from "@/lib/domain/package-credit";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user }) => {
  const rows = await prisma.packageCredit.findMany({
    where: { booking: { studentUserId: user!.id } },
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        include: {
          provider: { select: { id: true, displayName: true, photoUrl: true } },
          listing: { select: { title: true, lessonCount: true } },
          workspace: { select: { id: true } },
        },
      },
    },
  });
  return {
    packages: rows.map((p) => ({
      id: p.id,
      title: p.booking.listing.title,
      provider: p.booking.provider,
      purchasedCount: p.purchasedCount,
      consumedCount: p.consumedCount,
      remaining: remainingCredits(p),
      progress: packageProgress(p),
      workspaceId: p.booking.workspace?.id ?? null,
    })),
  };
});
