import "server-only";
import { prisma } from "@/lib/prisma";
import { assertBookingTransition, type BookingStatus } from "@/lib/domain/booking-state";
import { assertPaymentTransition, type PaymentStatus } from "@/lib/domain/payment-state";
import { computeCommission } from "@/lib/domain/commission";
import { effectivePlan } from "@/lib/domain/subscription";
import { getPaymentAdapter } from "@/lib/payments";
import { AuthorizationError } from "@/lib/authz";

export const DEFAULT_CANCELLATION_POLICY =
  "Free cancellation up to 24h before the lesson. Within 24h, the lesson is non-refundable unless the teacher agrees.";

/**
 * Create a PENDING_PAYMENT booking + its Payment shell.
 * Idempotent per (studentUserId, listingId, idempotencyKey).
 */
export async function createBooking(params: {
  studentUserId: string;
  listingId: string;
  availabilitySlotId?: string;
  scheduledAt?: Date;
  idempotencyKey: string;
}) {
  const existing = await prisma.booking.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
    include: { payment: true },
  });
  if (existing) return existing;

  const listing = await prisma.listing.findFirst({
    where: { id: params.listingId, status: "ACTIVE" },
    include: { provider: { select: { id: true, currency: true } } },
  });
  if (!listing) throw new AuthorizationError("This lesson is not available", 404);

  return prisma.$transaction(async (tx) => {
    if (params.availabilitySlotId) {
      const slot = await tx.availabilitySlot.findUnique({
        where: { id: params.availabilitySlotId },
      });
      if (!slot || slot.isBooked || slot.providerId !== listing.providerId) {
        throw new AuthorizationError("That time is no longer available", 409);
      }
      await tx.availabilitySlot.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });
    }

    const booking = await tx.booking.create({
      data: {
        providerId: listing.providerId,
        listingId: listing.id,
        studentUserId: params.studentUserId,
        availabilitySlotId: params.availabilitySlotId ?? null,
        scheduledAt: params.scheduledAt ?? null,
        status: "PENDING_PAYMENT",
        grossAmount: listing.priceAmount,
        currency: listing.currency,
        cancellationPolicy: DEFAULT_CANCELLATION_POLICY,
        idempotencyKey: params.idempotencyKey,
      },
    });

    await tx.payment.create({
      data: {
        bookingId: booking.id,
        status: "REQUIRES_PAYMENT",
        provider: getPaymentAdapter().name,
        currency: listing.currency,
        grossAmount: listing.priceAmount,
      },
    });

    return tx.booking.findUniqueOrThrow({
      where: { id: booking.id },
      include: { payment: true, listing: true, provider: true },
    });
  });
}

/**
 * Authorize + settle a booking's payment through the active adapter.
 *
 * Commission is captured from the provider plan effective AT THIS MOMENT
 * (authorization time) — the locked effective-time rule (10 §10).
 * Fully idempotent: a SUCCEEDED payment is returned unchanged.
 */
export async function settlePayment(params: {
  bookingId: string;
  actingUserId: string;
  idempotencyKey: string;
}) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { payment: { include: { attempts: true } }, provider: { include: { subscription: true } } },
  });
  if (!booking || !booking.payment) throw new AuthorizationError("Booking not found", 404);
  if (booking.studentUserId !== params.actingUserId) {
    throw new AuthorizationError("This booking is not yours");
  }
  if (booking.payment.status === "SUCCEEDED") {
    return { booking, payment: booking.payment, alreadySettled: true };
  }

  const planNow = booking.provider.subscription
    ? effectivePlan({
        status: booking.provider.subscription.status,
        trialEndsAt: booking.provider.subscription.trialEndsAt,
        currentPeriodEnd: booking.provider.subscription.currentPeriodEnd,
      })
    : "FREE";

  const adapter = getPaymentAdapter();
  const preliminary = computeCommission({
    grossAmount: booking.grossAmount,
    planAtAuthorization: planNow,
    currency: booking.currency,
  });

  const attempt = await prisma.paymentAttempt.create({
    data: {
      paymentId: booking.payment.id,
      status: "PROCESSING",
      amount: booking.grossAmount,
      provider: adapter.name,
      idempotencyKey: params.idempotencyKey,
    },
  });

  assertPaymentTransition(booking.payment.status as PaymentStatus, "PROCESSING");
  await prisma.payment.update({
    where: { id: booking.payment.id },
    data: { status: "PROCESSING" },
  });

  const intent = await adapter.createPaymentIntent({
    paymentId: booking.payment.id,
    amount: booking.grossAmount,
    currency: booking.currency,
    platformCommission: preliminary.platformCommission,
    idempotencyKey: params.idempotencyKey,
    metadata: { bookingId: booking.id },
  });

  if (intent.status !== "succeeded") {
    await prisma.$transaction([
      prisma.paymentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          providerRef: intent.providerRef,
          failureCode: intent.failureCode ?? "unknown",
          failureMessage: intent.failureMessage ?? "Payment failed",
        },
      }),
      prisma.payment.update({
        where: { id: booking.payment.id },
        data: { status: "FAILED" },
      }),
    ]);
    // Booking stays PENDING_PAYMENT — never falsely confirmed (11 §6 Payment Failure).
    return { booking, payment: null, failure: intent.failureMessage ?? "Payment failed" };
  }

  const finalSplit = computeCommission({
    grossAmount: booking.grossAmount,
    planAtAuthorization: planNow,
    processorFee: intent.processorFee,
    currency: booking.currency,
  });

  const result = await prisma.$transaction(async (tx) => {
    await tx.paymentAttempt.update({
      where: { id: attempt.id },
      data: { status: "SUCCEEDED", providerRef: intent.providerRef },
    });
    const payment = await tx.payment.update({
      where: { id: booking.payment!.id },
      data: {
        status: "SUCCEEDED",
        providerRef: intent.providerRef,
        platformCommission: finalSplit.platformCommission,
        commissionRate: finalSplit.rate,
        processorFee: finalSplit.processorFee,
        providerNet: finalSplit.providerNet,
        authorizedAt: new Date(),
        succeededAt: new Date(),
      },
    });
    assertBookingTransition("PENDING_PAYMENT", "CONFIRMED");
    const confirmed = await tx.booking.update({
      where: { id: booking.id },
      data: { status: "CONFIRMED" },
    });
    return { confirmed, payment };
  });

  // Package credit tracking (created outside the tx for clarity).
  const listing = await prisma.listing.findUnique({ where: { id: booking.listingId } });
  if (listing && listing.kind === "PACKAGE") {
    await prisma.packageCredit.upsert({
      where: { bookingId: booking.id },
      create: { bookingId: booking.id, purchasedCount: listing.lessonCount },
      update: {},
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: booking.studentUserId!,
        kind: "booking.confirmed",
        title: "Booking confirmed",
        body: `Your lesson with ${booking.provider.displayName} is confirmed.`,
      },
    ],
  });

  return { booking: result.confirmed, payment: result.payment, alreadySettled: false };
}

export async function transitionBooking(
  bookingId: string,
  to: BookingStatus,
  actor: { userId: string; role: "STUDENT" | "PROVIDER" | "ADMIN" },
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { provider: { select: { userId: true } } },
  });
  if (!booking) throw new AuthorizationError("Booking not found", 404);
  const isOwnerStudent = booking.studentUserId === actor.userId;
  const isOwnerProvider = booking.provider.userId === actor.userId;
  if (!isOwnerStudent && !isOwnerProvider && actor.role !== "ADMIN") {
    throw new AuthorizationError("Not allowed to change this booking");
  }
  assertBookingTransition(booking.status as BookingStatus, to);
  return prisma.booking.update({ where: { id: bookingId }, data: { status: to } });
}
