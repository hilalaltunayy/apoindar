import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { route, ApiError } from "@/lib/mobile-api/handler";
import { createBooking } from "@/lib/services/booking";

export const dynamic = "force-dynamic";

export const GET = route({ auth: true }, async ({ user }) => {
  const bookings = await prisma.booking.findMany({
    where: { studentUserId: user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, displayName: true, photoUrl: true } },
      listing: { select: { title: true, kind: true } },
      payment: { select: { status: true } },
    },
  });
  return {
    bookings: bookings.map((b) => ({
      id: b.id,
      reference: b.reference,
      status: b.status,
      paymentStatus: b.payment?.status ?? "REQUIRES_PAYMENT",
      scheduledAt: b.scheduledAt?.toISOString() ?? null,
      grossAmount: b.grossAmount,
      currency: b.currency,
      listingId: b.listingId,
      listing: { title: b.listing.title, kind: b.listing.kind },
      provider: b.provider,
    })),
  };
});

export const POST = route(
  {
    auth: true,
    role: "STUDENT",
    body: z.object({
      listingId: z.string().min(1),
      availabilitySlotId: z.string().optional(),
      scheduledAt: z.string().datetime().optional(),
      idempotencyKey: z.string().optional(),
    }),
  },
  async ({ user, body }) => {
    try {
      const booking = await createBooking({
        studentUserId: user!.id,
        listingId: body.listingId,
        availabilitySlotId: body.availabilitySlotId,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        idempotencyKey: body.idempotencyKey ?? randomUUID(),
      });
      return { id: booking.id, reference: booking.reference, status: booking.status };
    } catch (err) {
      throw new ApiError(409, "booking_failed", (err as Error).message);
    }
  },
);
