import "server-only";
import type { AuthTokenKind } from "@/lib/generated/prisma";
import { authLinkUrl } from "@/lib/services/auth-tokens";

/**
 * Email boundary. No provider is wired yet (05 §4 — Resend/SendGrid is Phase 2),
 * so dev logs the link the way Supabase Auth does. Swap the `deliver` impl for a
 * real provider later; call sites never change.
 */
type Template = "email_verify" | "password_reset";

const KIND: Record<Template, AuthTokenKind> = {
  email_verify: "EMAIL_VERIFY",
  password_reset: "PASSWORD_RESET",
};

export interface SendEmailInput {
  to: string;
  template: Template;
  token: string;
  name?: string | null;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const link = authLinkUrl(KIND[input.template], input.token);
  const subject =
    input.template === "email_verify"
      ? "Apoindar — e-postanı doğrula / confirm your email"
      : "Apoindar — şifre sıfırlama / reset your password";

  await deliver({ to: input.to, subject, link, template: input.template });
}

async function deliver(msg: { to: string; subject: string; link: string; template: Template }) {
  // eslint-disable-next-line no-console
  console.info(
    `\n📧 [email:${msg.template}] to=${msg.to}\n   ${msg.subject}\n   ${msg.link}\n`,
  );
  // TODO(phase-2): integrate Resend/SendGrid here. Keep this signature.
}
