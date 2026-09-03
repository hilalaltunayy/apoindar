import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { providerCalendar } from "@/lib/data/provider";
import { createRecurringLesson, resolveEntitlements } from "@/lib/services/provider";
import { AuthorizationError } from "@/lib/authz";

export const dynamic = "force-dynamic";

async function myProvider(userId: string) {
  const p = await prisma.provider.findUnique({ where: { userId }, select: { id: true } });
  if (!p) throw new ApiError(404, "no_provider");
  return p;
}

export const GET = route({ auth: true, role: "PROVIDER" }, async ({ user }) => {
  const p = await myProvider(user!.id);
  const [{ slots, lessons }, { entitlements }] = await Promise.all([
    providerCalendar(p.id),
    resolveEntitlements(p.id),
  ]);
  return {
    entitlements,
    slots: slots.map((s) => ({
      id: s.id,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      isBooked: s.isBooked,
    })),
    lessons: lessons.map((l) => ({
      id: l.id,
      startsAt: l.startsAt.toISOString(),
      endsAt: l.endsAt.toISOString(),
      status: l.status,
      studentName: l.student?.fullName ?? null,
      labelColor: l.student?.labelColor ?? null,
    })),
  };
});

export const POST = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      startsAt: z.string().datetime(),
      endsAt: z.string().datetime(),
    }),
  },
  async ({ user, body }) => {
    const p = await myProvider(user!.id);
    const startsAt = new Date(body.startsAt);
    const endsAt = new Date(body.endsAt);
    if (endsAt <= startsAt) throw new ApiError(422, "end_after_start");
    const clash = await prisma.availabilitySlot.findFirst({
      where: { providerId: p.id, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
    });
    if (clash) throw new ApiError(409, "slot_overlap");
    const slot = await prisma.availabilitySlot.create({
      data: { providerId: p.id, startsAt, endsAt },
    });
    return { id: slot.id };
  },
);

/** Premium-only recurring lessons (10 §7, 12 §15). */
export const PUT = route(
  {
    auth: true,
    role: "PROVIDER",
    body: z.object({
      studentId: z.string().min(1),
      weekday: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      durationMin: z.number().int().min(15).max(480),
      startDate: z.string(),
      occurrences: z.number().int().min(1).max(52),
      listingId: z.string().optional(),
    }),
  },
  async ({ user, body }) => {
    const p = await myProvider(user!.id);
    try {
      const res = await createRecurringLesson(p.id, user!.id, {
        ...body,
        startDate: new Date(body.startDate),
      });
      return { generated: res.generated, skippedForConflict: res.skippedForConflict };
    } catch (err) {
      if (err instanceof AuthorizationError) throw new ApiError(403, err.code ?? "forbidden", err.message);
      throw err;
    }
  },
);
