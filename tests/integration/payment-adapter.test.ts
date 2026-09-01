import { describe, it, expect } from "vitest";
import { MockPaymentAdapter } from "@/lib/payments/mock-adapter";
import { computeCommission } from "@/lib/domain/commission";

const adapter = new MockPaymentAdapter();

describe("mock payment adapter", () => {
  it("succeeds and reports a processor fee separate from commission", async () => {
    const r = await adapter.createPaymentIntent({
      paymentId: "p1",
      amount: 1_000_00,
      currency: "TRY",
      platformCommission: 120_00,
      idempotencyKey: "k1",
    });
    expect(r.status).toBe("succeeded");
    expect(r.processorFee).toBeGreaterThan(0);
    expect(r.processorFee).toBeLessThan(120_00); // fee ≠ commission, and smaller here
  });

  it("declines amounts ending in 13 when not forced to succeed", async () => {
    delete process.env.PAYMENT_MOCK_ALWAYS_SUCCEED;
    const r = await adapter.createPaymentIntent({
      paymentId: "p2",
      amount: 1_000_13,
      currency: "TRY",
      platformCommission: 0,
      idempotencyKey: "k2",
    });
    expect(r.status).toBe("failed");
    expect(r.failureCode).toBe("card_declined");
    process.env.PAYMENT_MOCK_ALWAYS_SUCCEED = "true";
  });

  it("verifies webhook signatures and rejects tampered payloads", () => {
    const payload = JSON.stringify({ type: "payment.succeeded", providerRef: "mock_pi_x" });
    const sig = MockPaymentAdapter.sign(payload);
    expect(adapter.parseWebhook(payload, sig).type).toBe("payment.succeeded");
    expect(() => adapter.parseWebhook(payload + " ", sig)).toThrow(/signature/i);
    expect(() => adapter.parseWebhook(payload, null)).toThrow();
  });
});

describe("commission flow — same booking, both plans (11 §6 Commission Flow)", () => {
  const GROSS = 1_200_00;
  it("Free → 12%, Premium → 7%, processor fee tracked separately", async () => {
    const intent = await adapter.createPaymentIntent({
      paymentId: "p3",
      amount: GROSS,
      currency: "TRY",
      platformCommission: 0,
      idempotencyKey: "k3",
    });

    const free = computeCommission({
      grossAmount: GROSS,
      planAtAuthorization: "FREE",
      processorFee: intent.processorFee,
    });
    const premium = computeCommission({
      grossAmount: GROSS,
      planAtAuthorization: "PREMIUM",
      processorFee: intent.processorFee,
    });

    expect(free.platformCommission).toBe(144_00);
    expect(premium.platformCommission).toBe(84_00);
    expect(free.grossAmount).toBe(GROSS);
    expect(premium.grossAmount).toBe(GROSS);
    // provider nets more on Premium by exactly the commission difference
    expect(premium.providerNet - free.providerNet).toBe(144_00 - 84_00);
    // processor fee identical, and not folded into commission
    expect(free.processorFee).toBe(intent.processorFee);
    expect(premium.processorFee).toBe(intent.processorFee);
  });
});
