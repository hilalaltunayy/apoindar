import "server-only";
import { prisma } from "@/lib/prisma";
import { effectivePlan } from "@/lib/domain/subscription";
import {
  entitlementsForPlan,
  canActivateListing,
  canAddActiveStudent,
  canCreateRecurringLesson,
  type EntitlementSnapshot,
} from "@/lib/domain/entitlements";
import { AuthorizationError } from "@/lib/authz";
import type { z } from "zod";
import type { listingSchema, studentSchema, recurringLessonSchema } from "@/lib/validation/schemas";
import { generateRecurringLessons, findConflicts } from "@/lib/domain/recurrence";

/** Fresh entitlement snapshot for a provider, derived from the DB subscription. */
export async function resolveEntitlements(providerId: string): Promise<{
  plan: "FREE" | "PREMIUM";
  entitlements: EntitlementSnapshot;
}> {
  const sub = await prisma.subscription.findUnique({ where: { providerId } });
  const plan = sub
    ? effectivePlan({
        status: sub.status,
        trialEndsAt: sub.trialEndsAt,
        currentPeriodEnd: sub.currentPeriodEnd,
      })
    : "FREE";
  return { plan, entitlements: entitlementsForPlan(plan) };
}

async function assertOwnership(providerId: string, ownerUserId: string) {
  const p = await prisma.provider.findFirst({
    where: { id: providerId, userId: ownerUserId },
    select: { id: true },
  });
  if (!p) throw new AuthorizationError("You do not own this provider profile");
}

// ─────────────────────────── Listings ───────────────────────────

export async function createListing(
  providerId: string,
  ownerUserId: string,
  input: z.infer<typeof listingSchema>,
  activate: boolean,
) {
  await assertOwnership(providerId, ownerUserId);
  const { entitlements } = await resolveEntitlements(providerId);

  if (activate) {
    const activeCount = await prisma.listing.count({
      where: { providerId, status: "ACTIVE" },
    });
    const check = canActivateListing(entitlements, activeCount);
    if (!check.allowed) throw new AuthorizationError(check.reason);
  }

  const category = input.categorySlug
    ? await prisma.educationCategory.findUnique({ where: { slug: input.categorySlug } })
    : null;

  return prisma.listing.create({
    data: {
      providerId,
      categoryId: category?.id ?? null,
      kind: input.kind,
      status: activate ? "ACTIVE" : "DRAFT",
      activatedAt: activate ? new Date() : null,
      title: input.title,
      description: input.description ?? null,
      priceAmount: input.priceAmount,
      durationMin: input.durationMin,
      lessonCount: input.lessonCount,
      deliveryMode: input.deliveryMode,
      packageTerms: input.packageTerms ?? null,
    },
  });
}

/** Server-side entitlement gate for flipping a listing to ACTIVE. */
export async function setListingActive(
  listingId: string,
  ownerUserId: string,
  active: boolean,
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { provider: { select: { id: true, userId: true } } },
  });
  if (!listing || listing.provider.userId !== ownerUserId) {
    throw new AuthorizationError("Listing not found");
  }
  if (active) {
    const { entitlements } = await resolveEntitlements(listing.providerId);
    const activeCount = await prisma.listing.count({
      where: { providerId: listing.providerId, status: "ACTIVE", id: { not: listingId } },
    });
    const check = canActivateListing(entitlements, activeCount);
    if (!check.allowed) throw new AuthorizationError(check.reason);
  }
  const updated = await prisma.listing.update({
    where: { id: listingId },
    data: { status: active ? "ACTIVE" : "INACTIVE", activatedAt: active ? new Date() : listing.activatedAt },
  });
  await refreshStartingPrice(listing.providerId);
  return updated;
}

export async function refreshStartingPrice(providerId: string) {
  const cheapest = await prisma.listing.findFirst({
    where: { providerId, status: "ACTIVE" },
    orderBy: { priceAmount: "asc" },
    select: { priceAmount: true },
  });
  await prisma.provider.update({
    where: { id: providerId },
    data: { startingPrice: cheapest?.priceAmount ?? null },
  });
}

// ─────────────────────────── Students ───────────────────────────

export async function addStudent(
  providerId: string,
  ownerUserId: string,
  input: z.infer<typeof studentSchema>,
) {
  await assertOwnership(providerId, ownerUserId);
  const { entitlements } = await resolveEntitlements(providerId);
  const activeCount = await prisma.studentProfile.count({
    where: { providerId, status: "ACTIVE" },
  });
  const check = canAddActiveStudent(entitlements, activeCount);
  if (!check.allowed) throw new AuthorizationError(check.reason);

  return prisma.studentProfile.create({
    data: {
      providerId,
      fullName: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      labelColor: input.labelColor ?? null,
    },
  });
}

/** Reactivating a FORMER/INACTIVE student is also gated by the active limit. */
export async function setStudentStatus(
  studentId: string,
  ownerUserId: string,
  status: "ACTIVE" | "INACTIVE" | "FORMER",
) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: { provider: { select: { id: true, userId: true } } },
  });
  if (!student || student.provider.userId !== ownerUserId) {
    throw new AuthorizationError("Student not found");
  }
  if (status === "ACTIVE" && student.status !== "ACTIVE") {
    const { entitlements } = await resolveEntitlements(student.providerId);
    const activeCount = await prisma.studentProfile.count({
      where: { providerId: student.providerId, status: "ACTIVE" },
    });
    const check = canAddActiveStudent(entitlements, activeCount);
    if (!check.allowed) throw new AuthorizationError(check.reason);
  }
  // Non-destructive: status change only, never deletes retained data (10 §11).
  return prisma.studentProfile.update({ where: { id: studentId }, data: { status } });
}

// ─────────────────────── Recurring lessons ──────────────────────

export async function createRecurringLesson(
  providerId: string,
  ownerUserId: string,
  input: z.infer<typeof recurringLessonSchema>,
) {
  await assertOwnership(providerId, ownerUserId);
  const { entitlements } = await resolveEntitlements(providerId);
  const gate = canCreateRecurringLesson(entitlements);
  if (!gate.allowed) throw new AuthorizationError(gate.reason); // Premium-only (10 §7)

  const student = await prisma.studentProfile.findFirst({
    where: { id: input.studentId, providerId },
    select: { id: true },
  });
  if (!student) throw new AuthorizationError("Student not found for this provider");

  const lessons = generateRecurringLessons({
    weekday: input.weekday,
    startTime: input.startTime,
    durationMin: input.durationMin,
    startDate: input.startDate,
    occurrences: input.occurrences,
  });

  const existing = await prisma.lessonInstance.findMany({
    where: {
      providerId,
      startsAt: { gte: lessons[0]!.startsAt, lte: lessons.at(-1)!.endsAt },
    },
    select: { startsAt: true, endsAt: true },
  });
  const conflicts = findConflicts(lessons, existing);

  const rule = await prisma.$transaction(async (tx) => {
    const created = await tx.recurringLessonRule.create({
      data: {
        providerId,
        studentId: input.studentId,
        listingId: input.listingId ?? null,
        weekday: input.weekday,
        startTime: input.startTime,
        durationMin: input.durationMin,
        startDate: input.startDate,
        occurrences: input.occurrences,
      },
    });
    await tx.lessonInstance.createMany({
      data: lessons
        .filter((l) => !conflicts.some((c) => +c.startsAt === +l.startsAt))
        .map((l) => ({
          providerId,
          studentId: input.studentId,
          recurringRuleId: created.id,
          startsAt: l.startsAt,
          endsAt: l.endsAt,
        })),
    });
    return created;
  });

  return { rule, generated: lessons.length, skippedForConflict: conflicts.length };
}
