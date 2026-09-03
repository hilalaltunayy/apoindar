import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  PaymentAdapter,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  CaptureInput,
  RefundInput,
  RefundResult,
  WebhookEvent,
} from "@/lib/payments/types";

/**
 * Mock marketplace payment provider for local/test (05 §1, 11 §5).
 * Deterministic: amounts ending in `13` fail; everything else succeeds.
 * Simulates a small processor fee so the "processor fee ≠ commission" rule is
 * exercised end-to-end.
 */
const MOCK_SECRET = process.env.PAYMENT_MOCK_WEBHOOK_SECRET ?? "mock-webhook-secret";
const PROCESSOR_FEE_RATE = 0.019; // ~1.9% — plausible card cost, mock only
const PROCESSOR_FEE_FIXED = 25; // 0.25 TRY

function fee(amount: number): number {
  return Math.round(amount * PROCESSOR_FEE_RATE) + PROCESSOR_FEE_FIXED;
}

function shouldFail(amount: number): boolean {
  if (process.env.PAYMENT_MOCK_ALWAYS_SUCCEED === "true") return false;
  return amount % 100 === 13; // e.g. 1_000_13
}

export class MockPaymentAdapter implements PaymentAdapter {
  readonly name = "mock";

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    const providerRef = `mock_pi_${input.paymentId}`;
    if (shouldFail(input.amount)) {
      return {
        providerRef,
        status: "failed",
        processorFee: 0,
        failureCode: "card_declined",
        failureMessage: "The mock card was declined.",
      };
    }
    return { providerRef, status: "succeeded", processorFee: fee(input.amount) };
  }

  async capture(input: CaptureInput): Promise<PaymentIntentResult> {
    return { providerRef: input.providerRef, status: "succeeded", processorFee: 0 };
  }

  async refund(input: RefundInput): Promise<RefundResult> {
    return { providerRef: `mock_re_${input.providerRef}`, status: "succeeded" };
  }

  parseWebhook(payload: string, signature: string | null): WebhookEvent {
    const expected = createHmac("sha256", MOCK_SECRET).update(payload).digest("hex");
    if (
      !signature ||
      signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      throw new Error("Invalid webhook signature");
    }
    const body = JSON.parse(payload) as { type?: string; providerRef?: string };
    const type =
      body.type === "payment.succeeded" ||
      body.type === "payment.failed" ||
      body.type === "refund.succeeded"
        ? body.type
        : "unknown";
    return { type, providerRef: body.providerRef ?? "", raw: body };
  }

  /** Test helper — sign a webhook body the way the mock provider would. */
  static sign(payload: string): string {
    return createHmac("sha256", MOCK_SECRET).update(payload).digest("hex");
  }
}
