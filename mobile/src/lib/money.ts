import { MINOR_UNITS_PER_MAJOR, CURRENCY } from "@shared/config/commerce";

/** minor units (kuruş) → major units. Mirrors the web `lib/money.ts`. */
export function toMajor(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

/**
 * Currency formatting. Re-implemented here (not imported from the web helper)
 * because Hermes' Intl currency support is inconsistent across devices — this
 * keeps a guaranteed Turkish-lira fallback.
 */
export function formatMoney(minor: number, currency: string = CURRENCY): string {
  const major = toMajor(minor);
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    const n = major.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${n} ₺`;
  }
}
