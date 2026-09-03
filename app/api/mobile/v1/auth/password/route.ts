import { z } from "zod";
import { route } from "@/lib/mobile-api/handler";
import {
  requestPasswordReset,
  resetPassword,
  changePassword,
  confirmEmail,
  sendEmailVerification,
} from "@/lib/services/password";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

const bodySchema = z.discriminatedUnion("action", [
  forgotPasswordSchema.extend({ action: z.literal("forgot") }),
  resetPasswordSchema.extend({ action: z.literal("reset") }),
  changePasswordSchema.extend({ action: z.literal("change") }),
  z.object({ action: z.literal("confirm_email"), token: z.string().min(10) }),
  z.object({ action: z.literal("resend_verify") }),
]);

/**
 * One endpoint, four password/email actions (12 §4). `change` requires auth;
 * the others are anonymous. Policy is enforced in the services, server-side.
 */
export const POST = route({ body: bodySchema, auth: false }, async ({ body, req }) => {
  switch (body.action) {
    case "forgot":
      await requestPasswordReset(body.email);
      return { ok: true }; // no account enumeration

    case "reset": {
      const r = await resetPassword(body.token, body.password);
      return r.ok ? { ok: true } : { ok: false, code: r.code };
    }

    case "confirm_email": {
      const r = await confirmEmail(body.token);
      return r.ok ? { ok: true } : { ok: false, code: r.code };
    }

    case "change": {
      const { authenticate } = await import("@/lib/mobile-api/handler");
      const user = await authenticate(req);
      const r = await changePassword(user.id, body.currentPassword, body.newPassword);
      return r.ok ? { ok: true } : { ok: false, code: r.code };
    }

    case "resend_verify": {
      const { authenticate } = await import("@/lib/mobile-api/handler");
      const user = await authenticate(req);
      await sendEmailVerification(user.id);
      return { ok: true };
    }
  }
});
