import { describe, it, expect } from "vitest";
import {
  computeCommission,
  resolveCommissionRate,
  estimatePremiumCommissionSaving,
} from "@/lib/domain/commission";
import { splitCommission } from "@/lib/money";

describe("commission split", () => {
  it("Free plan takes 12% of a 1,000 TRY booking", () => {
    const b = computeCommission({ grossAmount: 1_000_00, planAtAuthorization: "FREE" });
    expect(b.rate).toBe(0.12);
    expect(b.grossAmount).toBe(1_000_00);
    expect(b.platformCommission).toBe(120_00);
    expect(b.providerNet).toBe(880_00);
  });

  it("Premium plan takes 7% of the same booking", () => {
    const b = computeCommission({ grossAmount: 1_000_00, planAtAuthorization: "PREMIUM" });
    expect(b.rate).toBe(0.07);
    expect(b.platformCommission).toBe(70_00);
    expect(b.providerNet).toBe(930_00);
  });

  it("processor fee is tracked separately and reduces provider net, not commission", () => {
    const b = computeCommission({
      grossAmount: 1_000_00,
      planAtAuthorization: "FREE",
      processorFee: 25_00,
    });
    expect(b.platformCommission).toBe(120_00); // unchanged
    expect(b.processorFee).toBe(25_00);
    expect(b.providerNet).toBe(880_00 - 25_00);
  });

  it("rounds half-up deterministically", () => {
    // 333.33 TRY * 0.12 = 39.9996 → 40.00
    const { commission } = splitCommission(333_33, 0.12);
    expect(commission).toBe(40_00);
  });

  it("effective rate follows plan at authorization time (10 §10)", () => {
    expect(resolveCommissionRate("FREE")).toBe(0.12);
    expect(resolveCommissionRate("PREMIUM")).toBe(0.07);
  });

  it("supports config-driven overrides", () => {
    const b = computeCommission({
      grossAmount: 1_000_00,
      planAtAuthorization: "FREE",
      rateOverrides: { FREE: 0.1 },
    });
    expect(b.platformCommission).toBe(100_00);
  });

  it("rejects invalid input", () => {
    expect(() => splitCommission(-1, 0.12)).toThrow();
    expect(() => splitCommission(100, 1.5)).toThrow();
  });

  it("estimates Premium saving = 5pp of monthly volume", () => {
    expect(estimatePremiumCommissionSaving(5_980_00)).toBe(299_00);
    expect(estimatePremiumCommissionSaving(10_000_00)).toBe(500_00);
  });
});
