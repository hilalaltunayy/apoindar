import type { BookingStatus } from "@/lib/domain/booking-state";
import type { PaymentStatus } from "@/lib/domain/payment-state";

/**
 * Future paid student–provider workspace unlock rule (02 §5, 10 §15).
 * Opens ONLY after a successful eligible in-platform payment. Not built in V1 —
 * this predicate is the gate other code will consult when the feature ships.
 */
export function isWorkspaceEligible(input: {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
}): boolean {
  const paidOk =
    input.paymentStatus === "SUCCEEDED" || input.paymentStatus === "PARTIALLY_REFUNDED";
  const bookingOk =
    input.bookingStatus === "CONFIRMED" ||
    input.bookingStatus === "COMPLETED" ||
    input.bookingStatus === "NO_SHOW";
  return paidOk && bookingOk;
}

export const WORKSPACE_FEATURE_ENABLED = false;
