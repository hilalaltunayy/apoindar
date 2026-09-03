/**
 * Shared enum → localized label helper. The DB stores English enum values;
 * this maps them to the active locale via the `statusLabels` message namespace.
 * Pass a next-intl translator scoped to "statusLabels".
 */
type Translator = ((key: string) => string) & { has?: (key: string) => boolean };

export function statusLabel(status: string, t: Translator): string {
  if (t.has && !t.has(status)) return status.replace(/_/g, " ").toLowerCase();
  try {
    return t(status);
  } catch {
    return status.replace(/_/g, " ").toLowerCase();
  }
}

// Named aliases for readability at call sites.
export const bookingStatusLabel = statusLabel;
export const paymentStatusLabel = statusLabel;
export const listingStatusLabel = statusLabel;
export const studentStatusLabel = statusLabel;
export const moderationStatusLabel = statusLabel;
export const subscriptionStatusLabel = statusLabel;
