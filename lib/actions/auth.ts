"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-password";
import { signupSchema, loginSchema } from "@/lib/validation/schemas";
import { sendEmailVerification } from "@/lib/services/password";

/**
 * Actions return stable error *codes* (not localized text) so the client can
 * render them in the active language. `fields` lists which inputs failed.
 */
export type FormState = {
  code?:
    | "EMAIL_EXISTS"
    | "CREATED_LOGIN"
    | "WRONG_CREDENTIALS"
    | "INVALID_LOGIN"
    | "INVALID_SIGNUP"
    | "PASSWORD_POLICY"
    | "UNKNOWN";
  fields?: string[];
};

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "STUDENT",
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;
    if (flat.password?.includes("PASSWORD_POLICY")) {
      return { code: "PASSWORD_POLICY", fields: ["password"] };
    }
    return { code: "INVALID_SIGNUP", fields: Object.keys(flat) };
  }
  const { name, email, password, role } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return { code: "EMAIL_EXISTS", fields: ["email"] };

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      role,
      passwordHash: await hashPassword(password),
    },
  });

  if (role === "PROVIDER") {
    await prisma.provider.create({
      data: { userId: user.id, displayName: name.trim(), onboardingStep: 1 },
    });
  }

  await sendEmailVerification(user.id);

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
  } catch (err) {
    if (isRedirect(err)) throw err;
    if (err instanceof AuthError) return { code: "CREATED_LOGIN" };
    throw err;
  }

  redirect(role === "PROVIDER" ? "/onboarding/provider" : "/dashboard");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { code: "INVALID_LOGIN" };

  const next = (formData.get("next") as string) || "";
  const target = next.startsWith("/") ? next : "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (isRedirect(err)) throw err;
    if (err instanceof AuthError) return { code: "WRONG_CREDENTIALS" };
    throw err;
  }

  redirect(target);
}

/** Next's redirect() throws a control-flow error we must not swallow. */
function isRedirect(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
