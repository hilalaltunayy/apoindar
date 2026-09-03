import "server-only";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth-password";
import { isValidPassword } from "@/lib/domain/password-policy";
import { issueAuthToken, consumeAuthToken } from "@/lib/services/auth-tokens";
import { sendEmail } from "@/lib/services/email";

export type PasswordResult =
  | { ok: true }
  | { ok: false; code: "POLICY" | "WRONG_CURRENT" | "TOKEN_INVALID" | "NO_ACCOUNT" };

/**
 * Start a reset. Always returns ok (no account enumeration). When the email
 * exists, a PASSWORD_RESET token is issued and mailed (dev: logged).
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true },
  });
  if (user) {
    const token = await issueAuthToken(user.id, "PASSWORD_RESET");
    await sendEmail({ to: user.email, template: "password_reset", token, name: user.name });
  }
  return { ok: true };
}

/** Complete a reset with a valid token. Enforces the policy server-side (12 §4.1). */
export async function resetPassword(rawToken: string, newPassword: string): Promise<PasswordResult> {
  if (!isValidPassword(newPassword)) return { ok: false, code: "POLICY" };
  const res = await consumeAuthToken(rawToken, "PASSWORD_RESET");
  if (!res.ok) return { ok: false, code: "TOKEN_INVALID" };
  await prisma.user.update({
    where: { id: res.userId },
    data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() },
  });
  return { ok: true };
}

/** Authenticated in-app change (12 §4.4). Verifies the current password. */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<PasswordResult> {
  if (!isValidPassword(newPassword)) return { ok: false, code: "POLICY" };
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user?.passwordHash) return { ok: false, code: "NO_ACCOUNT" };
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return { ok: false, code: "WRONG_CURRENT" };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() },
  });
  return { ok: true };
}

/** Issue + send an email-verification token (12 §4.2). */
export async function sendEmailVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return;
  const token = await issueAuthToken(userId, "EMAIL_VERIFY");
  await sendEmail({ to: user.email, template: "email_verify", token, name: user.name });
}

export async function confirmEmail(rawToken: string): Promise<PasswordResult> {
  const res = await consumeAuthToken(rawToken, "EMAIL_VERIFY");
  if (!res.ok) return { ok: false, code: "TOKEN_INVALID" };
  await prisma.user.update({ where: { id: res.userId }, data: { emailVerified: new Date() } });
  return { ok: true };
}
