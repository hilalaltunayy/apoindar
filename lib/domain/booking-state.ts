export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED"
  | "NO_SHOW";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW", "REFUNDED"],
  COMPLETED: ["REFUNDED"],
  NO_SHOW: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertBookingTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransitionBooking(from, to)) {
    throw new Error(`Illegal booking transition ${from} → ${to}`);
  }
}

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW",
];

/** A booking counts toward "confirmed marketplace activity" only once paid. */
export function isConfirmedActivity(status: BookingStatus): boolean {
  return status === "CONFIRMED" || status === "COMPLETED" || status === "NO_SHOW";
}
