"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireProvider, AuthorizationError } from "@/lib/authz";
import {
  createListing,
  setListingActive,
  addStudent,
  setStudentStatus,
  createRecurringLesson,
} from "@/lib/services/provider";
import { beginTrial, activateSubscription, cancelSubscription } from "@/lib/services/subscription";
import { refundPayment } from "@/lib/services/refund";
import {
  listingSchema,
  studentSchema,
  availabilitySchema,
  recurringLessonSchema,
  providerOnboardingSchema,
  subscribeSchema,
  refundSchema,
} from "@/lib/validation/schemas";

export type ActionResult =
  | { ok: true; message?: string; data?: Record<string, number | string> }
  | { ok: false; error: string; code?: string };

function fail(err: unknown): ActionResult {
  if (err instanceof AuthorizationError) {
    return { ok: false, error: err.message, code: err.code };
  }
  return { ok: false, error: (err as Error).message || "Something went wrong." };
}

// ─────────────── Onboarding ───────────────

export async function saveProviderProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  const parsed = providerOnboardingSchema.safeParse({
    displayName: formData.get("displayName"),
    headline: formData.get("headline") || undefined,
    bio: formData.get("bio") || undefined,
    categorySlugs: formData.getAll("categorySlugs"),
    city: formData.get("city") || undefined,
    district: formData.get("district") || undefined,
    deliveryMode: formData.get("deliveryMode"),
    yearsExperience: formData.get("yearsExperience") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Validation failed", code: "VALIDATION" };

  try {
    const cats = await prisma.educationCategory.findMany({
      where: { slug: { in: parsed.data.categorySlugs } },
      select: { id: true },
    });
    await prisma.$transaction([
      prisma.provider.update({
        where: { id: provider.id },
        data: {
          displayName: parsed.data.displayName,
          headline: parsed.data.headline ?? null,
          bio: parsed.data.bio ?? null,
          city: parsed.data.city ?? null,
          district: parsed.data.district ?? null,
          deliveryMode: parsed.data.deliveryMode,
          yearsExperience: parsed.data.yearsExperience ?? null,
          onboardingStep: Math.max(provider.onboardingStep, 4),
        },
      }),
      prisma.providerCategory.deleteMany({ where: { providerId: provider.id } }),
      prisma.providerCategory.createMany({
        data: cats.map((c) => ({ providerId: provider.id, categoryId: c.id })),
      }),
    ]);
    void user;
    revalidatePath("/provider");
    return { ok: true, message: "Profile saved." };
  } catch (err) {
    return fail(err);
  }
}

export async function publishProviderAction(): Promise<ActionResult> {
  const { provider } = await requireProvider();
  const activeListings = await prisma.listing.count({
    where: { providerId: provider.id, status: "ACTIVE" },
  });
  if (activeListings < 1) {
    return { ok: false, error: "Needs a listing", code: "PUBLISH_NEEDS_LISTING" };
  }
  await prisma.provider.update({
    where: { id: provider.id },
    // Dev: auto-approve moderation so the marketplace is usable. Real moderation is an admin action.
    data: { published: true, moderationStatus: "APPROVED", onboardingStep: 9 },
  });
  revalidatePath("/provider");
  redirect("/provider");
}

// ─────────────── Listings ───────────────

export async function createListingAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  const priceMajor = Number(formData.get("priceAmount"));
  const parsed = listingSchema.safeParse({
    kind: formData.get("kind"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priceAmount: Number.isFinite(priceMajor) ? Math.round(priceMajor * 100) : NaN,
    durationMin: formData.get("durationMin"),
    lessonCount: formData.get("lessonCount") || 1,
    deliveryMode: formData.get("deliveryMode"),
    categorySlug: formData.get("categorySlug") || undefined,
    packageTerms: formData.get("packageTerms") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid listing." };
  }
  try {
    await createListing(provider.id, user.id, parsed.data, formData.get("activate") === "on");
    revalidatePath("/provider/listings");
    return { ok: true, message: "Listing created." };
  } catch (err) {
    return fail(err);
  }
}

export async function toggleListingAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireProvider();
  const listingId = formData.get("listingId") as string;
  const active = formData.get("active") === "true";
  try {
    await setListingActive(listingId, user.id, active);
    revalidatePath("/provider/listings");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ─────────────── Students ───────────────

export async function addStudentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  const parsed = studentSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    labelColor: formData.get("labelColor") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Validation failed", code: "VALIDATION" };
  try {
    await addStudent(provider.id, user.id, parsed.data);
    revalidatePath("/provider/students");
    return { ok: true, message: "Student added." };
  } catch (err) {
    return fail(err);
  }
}

export async function setStudentStatusAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireProvider();
  const studentId = formData.get("studentId") as string;
  const status = formData.get("status") as "ACTIVE" | "INACTIVE" | "FORMER";
  try {
    await setStudentStatus(studentId, user.id, status);
    revalidatePath("/provider/students");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function addStudentNoteAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider, entitlements } = await requireProvider();
  if (!entitlements.advancedCrm) {
    return { ok: false, error: "Premium feature", code: "PREMIUM_FEATURE" };
  }
  const studentId = formData.get("studentId") as string;
  const body = (formData.get("body") as string)?.trim();
  if (!studentId || !body) return { ok: false, error: "Empty note", code: "WRITE_NOTE" };
  try {
    const student = await prisma.studentProfile.findFirst({
      where: { id: studentId, providerId: provider.id },
      select: { id: true },
    });
    if (!student) return { ok: false, error: "Student not found", code: "NOT_FOUND" };
    await prisma.studentNote.create({ data: { studentId, providerId: provider.id, body } });
    void user;
    revalidatePath("/provider/students");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ─────────────── Calendar ───────────────

export async function addAvailabilityAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { provider } = await requireProvider();
  const parsed = availabilitySchema.safeParse({
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid time." };
  try {
    const clash = await prisma.availabilitySlot.findFirst({
      where: {
        providerId: provider.id,
        startsAt: { lt: parsed.data.endsAt },
        endsAt: { gt: parsed.data.startsAt },
      },
    });
    if (clash) return { ok: false, error: "Overlap", code: "SLOT_OVERLAP" };
    await prisma.availabilitySlot.create({
      data: { providerId: provider.id, startsAt: parsed.data.startsAt, endsAt: parsed.data.endsAt },
    });
    revalidatePath("/provider/calendar");
    return { ok: true, message: "Availability added." };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteAvailabilityAction(slotId: string): Promise<ActionResult> {
  const { provider } = await requireProvider();
  try {
    const slot = await prisma.availabilitySlot.findFirst({
      where: { id: slotId, providerId: provider.id },
    });
    if (!slot) return { ok: false, error: "Not found", code: "NOT_FOUND" };
    if (slot.isBooked) return { ok: false, error: "Booked", code: "SLOT_BOOKED" };
    await prisma.availabilitySlot.delete({ where: { id: slotId } });
    revalidatePath("/provider/calendar");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function createRecurringLessonAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  const parsed = recurringLessonSchema.safeParse({
    studentId: formData.get("studentId"),
    listingId: formData.get("listingId") || undefined,
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    durationMin: formData.get("durationMin"),
    startDate: formData.get("startDate"),
    occurrences: formData.get("occurrences"),
  });
  if (!parsed.success) return { ok: false, error: "Validation failed", code: "VALIDATION" };
  try {
    const res = await createRecurringLesson(provider.id, user.id, parsed.data);
    revalidatePath("/provider/calendar");
    return {
      ok: true,
      data: { generated: res.generated, skipped: res.skippedForConflict },
    };
  } catch (err) {
    return fail(err);
  }
}

// ─────────────── Subscription ───────────────

export async function subscribeAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  const parsed = subscribeSchema.safeParse({
    interval: formData.get("interval"),
    mode: formData.get("mode") ?? "trial",
  });
  if (!parsed.success) return { ok: false, error: "Validation failed", code: "VALIDATION" };
  try {
    if (parsed.data.mode === "trial") {
      await beginTrial(provider.id, user.id, parsed.data.interval);
    } else {
      await activateSubscription(provider.id, user.id, parsed.data.interval);
    }
    revalidatePath("/provider");
    revalidatePath("/premium");
    return { ok: true, message: "Premium is active." };
  } catch (err) {
    return fail(err);
  }
}

export async function cancelSubscriptionAction(): Promise<ActionResult> {
  const { user, provider } = await requireProvider();
  try {
    await cancelSubscription(provider.id, user.id);
    revalidatePath("/provider");
    revalidatePath("/premium");
    return { ok: true, message: "Premium will end when the paid period does. Your data stays." };
  } catch (err) {
    return fail(err);
  }
}

// ─────────────── Refund ───────────────

export async function refundBookingAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await requireProvider();
  const amountMajor = Number(formData.get("amount"));
  const parsed = refundSchema.safeParse({
    paymentId: formData.get("paymentId"),
    amount: Number.isFinite(amountMajor) ? Math.round(amountMajor * 100) : NaN,
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid refund", code: "VALID_REFUND" };
  try {
    await refundPayment({ ...parsed.data, actor: { userId: user.id, role: "PROVIDER" } });
    revalidatePath("/provider/bookings");
    revalidatePath("/provider/earnings");
    return { ok: true, message: "Refund processed." };
  } catch (err) {
    return fail(err);
  }
}
