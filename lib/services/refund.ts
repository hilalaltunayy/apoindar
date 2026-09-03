import "server-only";
import { prisma } from "@/lib/prisma";
import { applyRefund, providerNetAfterRefund } from "@/lib/domain/payment-state";
import { getPaymentAdapter } from "@/lib/payments";
import { AuthorizationError } from "@/lib/authz";

/**
 * Refund a paid booking (11 §6 Refund Flow). Updates payment + refund + booking
 * state and re-derives provider net. Admin or the owning provider may initiate.
 */
export async function refundPayment(params: {
  paymentId: string;
  amount: number;
  reason?: string;
  actor: { userId: string; role: "STUDENT" | "PROVIDER" | "ADMIN" };
}) {
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { booking: { include: { provider: { select: { userId: true } } } } },
  });
  if (!payment) throw new AuthorizationError("Payment not found", 404);
  if (
    params.actor.role !== "ADMIN" &&
    payment.booking.provider.userId !== params.actor.userId
  ) {
    throw new AuthorizationError("Not allowed to refund this payment");
  }
  if (payment.status !== "SUCCEEDED" && payment.status !== "PARTIALLY_REFUNDED") {
    throw new AuthorizationError("Only settled payments can be refunded");
  }

  const next = applyRefund({
    grossAmount: payment.grossAmount,
    alreadyRefunded: payment.refundedAmount,
    refundAmount: params.amount,
  });

  const providerRefResult = await getPaymentAdapter().refund({
    providerRef: payment.providerRef ?? payment.id,
    amount: params.amount,
    reason: params.reason,
    idempotencyKey: `refund_${payment.id}_${payment.refundedAmount + params.amount}`,
  });

  const newProviderNet = providerNetAfterRefund({
    originalProviderNet: payment.providerNet + payment.refundedAmount, // gross-of-prior-refunds net
    grossAmount: payment.grossAmount,
    refundedTotal: next.refundedTotal,
  });

  return prisma.$transaction(async (tx) => {
    await tx.refund.create({
      data: {
        paymentId: payment.id,
        amount: params.amount,
        reason: params.reason ?? null,
        status: providerRefResult.status === "succeeded" ? "SUCCEEDED" : "PENDING",
        providerRef: providerRefResult.providerRef,
      },
    });
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: next.status,
        refundedAmount: next.refundedTotal,
        providerNet: newProviderNet,
      },
    });
    const bookingStatus = next.status === "REFUNDED" ? "REFUNDED" : payment.booking.status;
    const updatedBooking = await tx.booking.update({
      where: { id: payment.bookingId },
      data: { status: bookingStatus },
    });
    return { payment: updatedPayment, booking: updatedBooking };
  });
}
