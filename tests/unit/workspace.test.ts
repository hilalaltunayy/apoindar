import { describe, it, expect } from "vitest";
import { isWorkspaceEligible, WORKSPACE_FEATURE_ENABLED } from "@/lib/domain/workspace";

describe("paid workspace unlock rule (02 §5, 10 §15)", () => {
  it("opens only after a successful eligible in-platform payment", () => {
    expect(isWorkspaceEligible({ bookingStatus: "CONFIRMED", paymentStatus: "SUCCEEDED" })).toBe(true);
    expect(isWorkspaceEligible({ bookingStatus: "COMPLETED", paymentStatus: "PARTIALLY_REFUNDED" })).toBe(true);
  });
  it("stays closed without a successful payment", () => {
    expect(isWorkspaceEligible({ bookingStatus: "PENDING_PAYMENT", paymentStatus: "REQUIRES_PAYMENT" })).toBe(false);
    expect(isWorkspaceEligible({ bookingStatus: "CANCELLED", paymentStatus: "SUCCEEDED" })).toBe(false);
    expect(isWorkspaceEligible({ bookingStatus: "CONFIRMED", paymentStatus: "FAILED" })).toBe(false);
  });
  it("is not built in V1", () => {
    expect(WORKSPACE_FEATURE_ENABLED).toBe(false);
  });
});
