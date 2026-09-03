import { MINOR_UNITS_PER_MAJOR, CURRENCY } from "@/lib/config/commerce";

/** Round half-up to the nearest minor unit. Deterministic for financial math. */
export function roundMinor(value: number): number {
  return Math.round(value + Number.EPSILON);
}

/** Split a gross amount into commission + provider net, given an effective rate. */
export function splitCommission(
  grossMinor: number,
  rate: number,
): { gross: number; commission: number; providerNet: number } {
  if (!Number.isInteger(grossMinor) || grossMinor < 0) {
    throw new Error(`grossMinor must be a non-negative integer, got ${grossMinor}`);
  }
  if (rate < 0 || rate > 1) {
    throw new Error(`commission rate must be within [0,1], got ${rate}`);
  }
  const commission = roundMinor(grossMinor * rate);
  return { gross: grossMinor, commission, providerNet: grossMinor - commission };
}

export function toMinor(major: number): number {
  return roundMinor(major * MINOR_UNITS_PER_MAJOR);
}

export function toMajor(minor: number): number {
  return minor / MINOR_UNITS_PER_MAJOR;
}

/** "1.234,56 ₺" — Turkish locale, used only in the presentation layer. */
export function formatMoney(minor: number, currency: string = CURRENCY): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toMajor(minor));
}
