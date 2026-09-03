export type PaymentStatus =
  | "REQUIRES_PAYMENT"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

const TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  REQUIRES_PAYMENT: ["PROCESSING", "CANCELLED", "FAILED"],
  PROCESSING: ["SUCCEEDED", "FAILED"],
  FAILED: ["PROCESSING", "REQUIRES_PAYMENT", "CANCELLED"], // retry allowed
  SUCCEEDED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  PARTIALLY_REFUNDED: ["REFUNDED", "PARTIALLY_REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Illegal payment transition ${from} → ${to}`);
  }
}

export function isSettled(status: PaymentStatus): boolean {
  return status === "SUCCEEDED" || status === "PARTIALLY_REFUNDED";
}

/**
 * Refund calculation. Returns the new refunded total, remaining, and the
 * resulting payment status. Guards against over-refunding (11 §20, §23).
 */
export function applyRefund(params: {
  grossAmount: number;
  alreadyRefunded: number;
  refundAmount: number;
}): { refundedTotal: number; remaining: number; status: PaymentStatus } {
  const { grossAmount, alreadyRefunded, refundAmount } = params;
  if (refundAmount <= 0) throw new Error("Refund amount must be positive");
  const refundedTotal = alreadyRefunded + refundAmount;
  if (refundedTotal > grossAmount) {
    throw new Error(
      `Refund ${refundAmount} exceeds refundable balance ${grossAmount - alreadyRefunded}`,
    );
  }
  const remaining = grossAmount - refundedTotal;
  return {
    refundedTotal,
    remaining,
    status: remaining === 0 ? "REFUNDED" : "PARTIALLY_REFUNDED",
  };
}

/** Provider net after a refund: refunds reduce provider net proportionally to the effective rate. */
export function providerNetAfterRefund(params: {
  originalProviderNet: number;
  grossAmount: number;
  refundedTotal: number;
}): number {
  const { originalProviderNet, grossAmount, refundedTotal } = params;
  if (grossAmount === 0) return 0;
  const keptFraction = (grossAmount - refundedTotal) / grossAmount;
  return Math.round(originalProviderNet * keptFraction);
}
