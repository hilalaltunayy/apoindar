"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { resetPasswordAction, type PwState } from "@/lib/actions/password";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordCriteria } from "@/components/auth/PasswordCriteria";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("authLinks");
  const [state, action, pending] = useActionState<PwState, FormData>(resetPasswordAction, {});
  const [pw, setPw] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">{t("resetTitle")}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("resetBody")}</p>
      </div>
      <input type="hidden" name="token" value={token} />
      <FormField label={t("newPassword")} required>
        {(p) => (
          <PasswordInput
            {...p}
            name="password"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        )}
      </FormField>
      <PasswordCriteria value={pw} />
      {state.code ? (
        <p className="text-sm text-state-danger">
          {state.code === "PASSWORD_POLICY" ? t("policyError") : t("linkInvalidBody")}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("working") : t("resetCta")}
      </Button>
    </form>
  );
}
