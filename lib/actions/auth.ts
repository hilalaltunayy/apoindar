"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-password";
import { signupSchema, loginSchema } from "@/lib/validation/schemas";

export type FormState = { error?: string; fieldErrors?: Record<string, string[]> };

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "STUDENT",
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: { name, email, role, passwordHash: await hashPassword(password) },
  });

  if (role === "PROVIDER") {
    await prisma.provider.create({
      data: { userId: user.id, displayName: name, onboardingStep: 1 },
    });
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Account created — please log in." };
    throw err;
  }
  redirect(role === "PROVIDER" ? "/onboarding/provider" : "/dashboard");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return { error: "Wrong email or password." };
    throw err;
  }
  const next = (formData.get("next") as string) || "/dashboard";
  redirect(next.startsWith("/") ? next : "/dashboard");
}
