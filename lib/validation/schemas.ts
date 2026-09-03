import { z } from "zod";
import { isValidPassword } from "@/lib/domain/password-policy";

/** Shared strong-password field (12 §4.1) — enforced server-side everywhere. */
export const strongPassword = z
  .string()
  .max(200)
  .refine(isValidPassword, { message: "PASSWORD_POLICY" });

export const signupSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email(),
    password: strongPassword,
    role: z.enum(["STUDENT", "PROVIDER"]).default("STUDENT"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: strongPassword,
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: strongPassword,
  })
  .strict();

export const forgotPasswordSchema = z.object({ email: z.string().email() }).strict();

export const providerOnboardingSchema = z
  .object({
    displayName: z.string().min(2).max(80),
    headline: z.string().max(140).optional(),
    bio: z.string().max(2000).optional(),
    categorySlugs: z.array(z.string()).min(1).max(5),
    city: z.string().max(80).optional(),
    district: z.string().max(80).optional(),
    deliveryMode: z.enum(["ONLINE", "IN_PERSON", "BOTH"]),
    yearsExperience: z.coerce.number().int().min(0).max(70).optional(),
  })
  .strict();

export const listingSchema = z
  .object({
    kind: z.enum(["SINGLE_LESSON", "PACKAGE"]),
    title: z.string().min(3).max(120),
    description: z.string().max(2000).optional(),
    priceAmount: z.coerce.number().int().positive().max(100_000_00),
    durationMin: z.coerce.number().int().min(15).max(480),
    lessonCount: z.coerce.number().int().min(1).max(100),
    deliveryMode: z.enum(["ONLINE", "IN_PERSON", "BOTH"]),
    categorySlug: z.string().optional(),
    packageTerms: z.string().max(1000).optional(),
  })
  .strict()
  .refine((v) => (v.kind === "PACKAGE" ? v.lessonCount > 1 : v.lessonCount === 1), {
    message: "Packages need more than one lesson; single lessons must be exactly one.",
    path: ["lessonCount"],
  });

export const studentSchema = z
  .object({
    fullName: z.string().min(2).max(80),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().max(30).optional().or(z.literal("")),
    labelColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  })
  .strict();

export const availabilitySchema = z
  .object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
  })
  .strict()
  .refine((v) => v.endsAt > v.startsAt, { message: "End must be after start", path: ["endsAt"] })
  .refine((v) => v.startsAt > new Date(Date.now() - 60_000), {
    message: "Availability cannot be in the past",
    path: ["startsAt"],
  });

export const recurringLessonSchema = z
  .object({
    studentId: z.string().min(1),
    listingId: z.string().optional(),
    weekday: z.coerce.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    durationMin: z.coerce.number().int().min(15).max(480),
    startDate: z.coerce.date(),
    occurrences: z.coerce.number().int().min(1).max(52),
  })
  .strict();

export const createBookingSchema = z
  .object({
    listingId: z.string().min(1),
    availabilitySlotId: z.string().optional(),
    scheduledAt: z.coerce.date().optional(),
  })
  .strict();

export const subscribeSchema = z
  .object({
    interval: z.enum(["MONTH", "YEAR"]),
    mode: z.enum(["trial", "paid"]).default("trial"),
  })
  .strict();

export const refundSchema = z
  .object({
    paymentId: z.string().min(1),
    amount: z.coerce.number().int().positive(),
    reason: z.string().max(300).optional(),
  })
  .strict();
