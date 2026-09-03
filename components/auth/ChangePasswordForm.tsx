"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { changePasswordAction, type PwState } from "@/lib/actions/password";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordCriteria } from "@/components/auth/PasswordCriteria";

export function ChangePasswordForm() {
  const t = useTranslations("security");
  const [state, action, pending] = useActionState<PwState, FormData>(changePasswordAction, {});
  const [pw, setPw] = useState("");

  return (
    <form action={action} className="max-w-md space-y-4">
      <FormField label={t("currentPassword")} required>
        {(p) => <PasswordInput {...p} name="currentPassword" autoComplete="current-password" required />}
      </FormField>
      <FormField label={t("newPassword")} required>
        {(p) => (
          <PasswordInput
            {...p}
            name="newPassword"
            autoComplete="new-password"
            required
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
        )}
      </FormField>
      <PasswordCriteria value={pw} />
      {state.code === "WRONG_CURRENT" ? (
        <p className="text-sm text-state-danger">{t("wrongCurrent")}</p>
      ) : state.code === "POLICY" || state.code === "PASSWORD_POLICY" ? (
        <p className="text-sm text-state-danger">{t("policyError")}</p>
      ) : null}
      {state.ok ? <p className="text-sm text-state-success">{t("changed")}</p> : null}
      <p className="text-xs text-ink-tertiary">{t("sessionNote")}</p>
      <Button type="submit" disabled={pending}>
        {t("changeCta")}
      </Button>
    </form>
  );
}
