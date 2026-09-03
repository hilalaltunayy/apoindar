import { describe, it, expect } from "vitest";
import {
  canTransitionBooking,
  assertBookingTransition,
  isConfirmedActivity,
} from "@/lib/domain/booking-state";
import {
  canTransitionPayment,
  applyRefund,
  providerNetAfterRefund,
  isSettled,
} from "@/lib/domain/payment-state";

describe("booking state machine", () => {
  it("pending → confirmed only via payment success path", () => {
    expect(canTransitionBooking("PENDING_PAYMENT", "CONFIRMED")).toBe(true);
    expect(canTransitionBooking("PENDING_PAYMENT", "COMPLETED")).toBe(false);
  });
  it("cannot resurrect a cancelled booking", () => {
    expect(canTransitionBooking("CANCELLED", "CONFIRMED")).toBe(false);
    expect(() => assertBookingTransition("CANCELLED", "CONFIRMED")).toThrow();
  });
  it("confirmed/completed/no-show count as marketplace activity", () => {
    expect(isConfirmedActivity("CONFIRMED")).toBe(true);
    expect(isConfirmedActivity("PENDING_PAYMENT")).toBe(false);
  });
});

describe("payment state machine", () => {
  it("failed payments can be retried, not falsely confirmed", () => {
    expect(canTransitionPayment("FAILED", "PROCESSING")).toBe(true);
    expect(canTransitionPayment("FAILED", "SUCCEEDED")).toBe(false);
  });
  it("succeeded can only move to refund states", () => {
    expect(canTransitionPayment("SUCCEEDED", "PARTIALLY_REFUNDED")).toBe(true);
    expect(canTransitionPayment("SUCCEEDED", "PROCESSING")).toBe(false);
  });
  it("isSettled", () => {
    expect(isSettled("SUCCEEDED")).toBe(true);
    expect(isSettled("FAILED")).toBe(false);
  });
});

describe("refund math", () => {
  it("partial then full refund", () => {
    const first = applyRefund({ grossAmount: 1_000_00, alreadyRefunded: 0, refundAmount: 300_00 });
    expect(first.status).toBe("PARTIALLY_REFUNDED");
    expect(first.refundedTotal).toBe(300_00);
    const second = applyRefund({
      grossAmount: 1_000_00,
      alreadyRefunded: 300_00,
      refundAmount: 700_00,
    });
    expect(second.status).toBe("REFUNDED");
    expect(second.remaining).toBe(0);
  });
  it("rejects over-refund", () => {
    expect(() =>
      applyRefund({ grossAmount: 1_000_00, alreadyRefunded: 800_00, refundAmount: 300_00 }),
    ).toThrow();
  });
  it("provider net shrinks proportionally to refunded fraction", () => {
    // Free booking 1,000 → net 880. Refund 50% → net 440.
    expect(
      providerNetAfterRefund({ originalProviderNet: 880_00, grossAmount: 1_000_00, refundedTotal: 500_00 }),
    ).toBe(440_00);
  });
});
