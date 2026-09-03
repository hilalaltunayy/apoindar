import { api } from "./api";
import type { RecommendationEventType } from "./types";

interface SignalInput {
  type: RecommendationEventType;
  providerId?: string;
  categorySlug?: string;
  city?: string;
  query?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget recommendation signal (12 §8). Never blocks UI, never throws —
 * the backend persists these to an append-only log that ranking does not yet read.
 */
export function logSignal(input: SignalInput): void {
  void api("/recommendation-events", { method: "POST", body: input }).catch(() => {});
}
