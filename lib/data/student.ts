import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";

export async function studentDashboard(userId: string) {
  return safeQuery(
    async () => {
      const now = new Date();
      const [upcoming, packages, recentProviders] = await Promise.all([
        prisma.booking.findMany({
          where: { studentUserId: userId, status: "CONFIRMED", scheduledAt: { gte: now } },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: { provider: { select: { id: true, displayName: true, photoUrl: true } }, listing: true },
        }),
        prisma.packageCredit.findMany({
          where: { booking: { studentUserId: userId } },
          include: {
            booking: {
              include: { provider: { select: { displayName: true } }, listing: { select: { title: true } } },
            },
          },
        }),
        prisma.booking.findMany({
          where: { studentUserId: userId, status: { in: ["CONFIRMED", "COMPLETED"] } },
          orderBy: { createdAt: "desc" },
          take: 4,
          include: { provider: { select: { id: true, displayName: true, photoUrl: true, headline: true } } },
        }),
      ]);
      return { upcoming, packages, recentProviders };
    },
    { upcoming: [], packages: [], recentProviders: [] },
  );
}

export async function studentBookings(userId: string) {
  return safeQuery(
    () =>
      prisma.booking.findMany({
        where: { studentUserId: userId },
        orderBy: { createdAt: "desc" },
        include: {
          provider: { select: { id: true, displayName: true } },
          listing: { select: { title: true, kind: true } },
          payment: { select: { status: true } },
        },
      }),
    [],
  );
}

export async function studentPackages(userId: string) {
  return safeQuery(
    () =>
      prisma.packageCredit.findMany({
        where: { booking: { studentUserId: userId } },
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            include: {
              provider: { select: { id: true, displayName: true } },
              listing: { select: { title: true, lessonCount: true } },
            },
          },
        },
      }),
    [],
  );
}
