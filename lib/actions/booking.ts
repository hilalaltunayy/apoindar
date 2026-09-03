"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/authz";
import { createBooking, settlePayment, transitionBooking } from "@/lib/services/booking";
import { createBookingSchema } from "@/lib/validation/schemas";

export type BookingActionState =
  | { ok: true; bookingId: string; reference?: string }
  | { ok: false; error: string };

export async function startBookingAction(
  _prev: BookingActionState | null,
  formData: FormData,
): Promise<BookingActionState> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please log in to book." };
  if (user.role === "PROVIDER") return { ok: false, error: "Switch to a student account to book lessons." };

  const parsed = createBookingSchema.safeParse({
    listingId: formData.get("listingId"),
    availabilitySlotId: formData.get("availabilitySlotId") || undefined,
    scheduledAt: formData.get("scheduledAt") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid booking details." };

  try {
    const booking = await createBooking({
      studentUserId: user.id,
      listingId: parsed.data.listingId,
      availabilitySlotId: parsed.data.availabilitySlotId,
      scheduledAt: parsed.data.scheduledAt,
      idempotencyKey: (formData.get("idempotencyKey") as string) || randomUUID(),
    });
    return { ok: true, bookingId: booking.id, reference: booking.reference };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function payBookingAction(
  _prev: BookingActionState | null,
  formData: FormData,
): Promise<BookingActionState> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please log in." };
  const bookingId = formData.get("bookingId") as string;
  if (!bookingId) return { ok: false, error: "Missing booking." };

  try {
    const res = await settlePayment({
      bookingId,
      actingUserId: user.id,
      idempotencyKey: (formData.get("idempotencyKey") as string) || randomUUID(),
    });
    if (!res.payment && "failure" in res) {
      return { ok: false, error: res.failure ?? "Payment failed. Please try again." };
    }
    revalidatePath("/bookings");
    return { ok: true, bookingId };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export async function cancelBookingAction(bookingId: string): Promise<BookingActionState> {
  const user = await currentUser();
  if (!user) return { ok: false, error: "Please log in." };
  try {
    await transitionBooking(bookingId, "CANCELLED", { userId: user.id, role: user.role });
    revalidatePath("/bookings");
    revalidatePath("/provider/bookings");
    return { ok: true, bookingId };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
