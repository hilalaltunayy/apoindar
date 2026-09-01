import type { PaymentAdapter } from "@/lib/payments/types";
import { MockPaymentAdapter } from "@/lib/payments/mock-adapter";

let cached: PaymentAdapter | null = null;

/**
 * Resolve the active payment adapter from config. Only "mock" ships in V1;
 * a production provider is wired here once selected and approved (11 §27, 14 §1).
 */
export function getPaymentAdapter(): PaymentAdapter {
  if (cached) return cached;
  const provider = process.env.PAYMENT_PROVIDER ?? "mock";
  switch (provider) {
    case "mock":
      cached = new MockPaymentAdapter();
      break;
    default:
      throw new Error(
        `Unknown PAYMENT_PROVIDER "${provider}". Production providers require explicit approval.`,
      );
  }
  return cached;
}

export type { PaymentAdapter } from "@/lib/payments/types";
