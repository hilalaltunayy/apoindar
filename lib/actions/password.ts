"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@/lib/authz";
import {
  requestPasswordReset,
  resetPassword,
  changePassword,
  confirmEmail,
} from "@/lib/services/password";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validation/schemas";

export type PwState = { code?: string; ok?: boolean };

export async function forgotPasswordAction(_p: PwState, fd: FormData): Promise<PwState> {
  const parsed = forgotPasswordSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) return { code: "INVALID_EMAIL" };
  await requestPasswordReset(parsed.data.email);
  return { ok: true }; // always ok — no account enumeration
}

export async function resetPasswordAction(_p: PwState, fd: FormData): Promise<PwState> {
  const parsed = resetPasswordSchema.safeParse({
    token: fd.get("token"),
    password: fd.get("password"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { code: msg === "PASSWORD_POLICY" ? "PASSWORD_POLICY" : "INVALID" };
  }
  const r = await resetPassword(parsed.data.token, parsed.data.password);
  if (!r.ok) return { code: r.code };
  redirect("/login?reset=1");
}

export async function changePasswordAction(_p: PwState, fd: FormData): Promise<PwState> {
  const user = await currentUser();
  if (!user) return { code: "UNAUTHENTICATED" };
  const parsed = changePasswordSchema.safeParse({
    currentPassword: fd.get("currentPassword"),
    newPassword: fd.get("newPassword"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message;
    return { code: msg === "PASSWORD_POLICY" ? "PASSWORD_POLICY" : "INVALID" };
  }
  const r = await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
  return r.ok ? { ok: true } : { code: r.code };
}

export async function confirmEmailAction(token: string): Promise<PwState> {
  const r = await confirmEmail(token);
  return r.ok ? { ok: true } : { code: r.code };
}
