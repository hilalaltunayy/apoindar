/**
 * Provider-neutral payment boundary (04 §6, 05 §3, 11 §2.2).
 * Business logic depends ONLY on this interface — never on a concrete SDK.
 * A production marketplace provider is added as another implementation, gated
 * behind explicit approval + credentials.
 */

export type PaymentIntentStatus = "requires_action" | "succeeded" | "failed";

export interface CreatePaymentIntentInput {
  /** Our Payment row id — used as the idempotency anchor. */
  paymentId: string;
  amount: number; // minor units
  currency: string;
  /** Marketplace split, informational for providers that support submerchants. */
  providerAccountRef?: string | null;
  platformCommission: number;
  metadata?: Record<string, string>;
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  providerRef: string;
  status: PaymentIntentStatus;
  /** Present when status === "requires_action" (e.g. hosted page / 3DS). */
  clientActionUrl?: string;
  processorFee: number; // minor units, provider cost — NOT the marketplace commission
  failureCode?: string;
  failureMessage?: string;
}

export interface CaptureInput {
  providerRef: string;
  idempotencyKey: string;
}

export interface RefundInput {
  providerRef: string;
  amount: number;
  reason?: string;
  idempotencyKey: string;
}

export interface RefundResult {
  providerRef: string;
  status: "succeeded" | "pending" | "failed";
}

export interface WebhookEvent {
  type: "payment.succeeded" | "payment.failed" | "refund.succeeded" | "unknown";
  providerRef: string;
  raw: unknown;
}

export interface PaymentAdapter {
  readonly name: string;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  capture(input: CaptureInput): Promise<PaymentIntentResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  /** Verify signature + normalise a raw provider webhook. Throws on bad signature. */
  parseWebhook(payload: string, signature: string | null): WebhookEvent;
}
