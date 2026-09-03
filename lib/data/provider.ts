import "server-only";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { requireProvider } from "@/lib/authz";
import { reconcilePlan } from "@/lib/services/subscription";

/** Provider context + a plan reconciliation pass (trial expiry lands here). */
export async function providerHome() {
  const ctx = await requireProvider();
  await safeQuery(() => reconcilePlan(ctx.provider.id), undefined);
  return requireProvider(); // re-read post-reconcile
}

export async function providerDashboardData(providerId: string) {
  return safeQuery(
    async () => {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(startOfDay.getTime() + 86_400_000);

      const [todayLessons, upcoming, activeStudents, recentPayments, listings] = await Promise.all([
        prisma.lessonInstance.findMany({
          where: { providerId, startsAt: { gte: startOfDay, lt: endOfDay } },
          orderBy: { startsAt: "asc" },
          include: { student: { select: { fullName: true } } },
        }),
        prisma.booking.findMany({
          where: { providerId, status: "CONFIRMED", scheduledAt: { gte: now } },
          orderBy: { scheduledAt: "asc" },
          take: 5,
          include: { listing: { select: { title: true } }, studentUser: { select: { name: true } } },
        }),
        prisma.studentProfile.count({ where: { providerId, status: "ACTIVE" } }),
        prisma.payment.findMany({
          where: { booking: { providerId }, status: "SUCCEEDED" },
          orderBy: { succeededAt: "desc" },
          take: 5,
          include: { booking: { include: { listing: { select: { title: true } } } } },
        }),
        prisma.listing.count({ where: { providerId, status: "ACTIVE" } }),
      ]);

      const revenue30d = await prisma.payment.aggregate({
        where: {
          booking: { providerId },
          status: "SUCCEEDED",
          succeededAt: { gte: new Date(now.getTime() - 30 * 86_400_000) },
        },
        _sum: { providerNet: true, grossAmount: true },
      });

      return {
        todayLessons,
        upcoming,
        activeStudents,
        recentPayments,
        activeListings: listings,
        revenue30dNet: revenue30d._sum.providerNet ?? 0,
        revenue30dGross: revenue30d._sum.grossAmount ?? 0,
      };
    },
    {
      todayLessons: [],
      upcoming: [],
      activeStudents: 0,
      recentPayments: [],
      activeListings: 0,
      revenue30dNet: 0,
      revenue30dGross: 0,
    },
  );
}

export async function providerListings(providerId: string) {
  return safeQuery(
    () =>
      prisma.listing.findMany({
        where: { providerId },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        include: { category: { select: { name: true } }, _count: { select: { bookings: true } } },
      }),
    [],
  );
}

export async function providerStudents(providerId: string) {
  return safeQuery(
    () =>
      prisma.studentProfile.findMany({
        where: { providerId },
        orderBy: [{ status: "asc" }, { fullName: "asc" }],
        include: {
          _count: { select: { bookings: true, lessonInstances: true } },
          notes: { orderBy: { createdAt: "desc" }, take: 3 },
          bookings: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { listing: { select: { title: true } } },
          },
        },
      }),
    [],
  );
}

export async function providerBookings(providerId: string) {
  return safeQuery(
    () =>
      prisma.booking.findMany({
        where: { providerId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          listing: { select: { title: true } },
          studentUser: { select: { name: true, email: true } },
          payment: { select: { status: true, providerNet: true, platformCommission: true } },
        },
      }),
    [],
  );
}

export async function providerCalendar(providerId: string) {
  return safeQuery(
    async () => {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(from.getTime() + 14 * 86_400_000);
      const [slots, lessons] = await Promise.all([
        prisma.availabilitySlot.findMany({
          where: { providerId, startsAt: { gte: from, lt: to } },
          orderBy: { startsAt: "asc" },
        }),
        prisma.lessonInstance.findMany({
          where: { providerId, startsAt: { gte: from, lt: to } },
          orderBy: { startsAt: "asc" },
          include: { student: { select: { fullName: true, labelColor: true } } },
        }),
      ]);
      return { slots, lessons, from, to };
    },
    { slots: [], lessons: [], from: new Date(), to: new Date() },
  );
}
