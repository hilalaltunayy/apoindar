"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { forgotPasswordAction, type PwState } from "@/lib/actions/password";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";

export function ForgotPasswordForm() {
  const t = useTranslations("authLinks");
  const [state, action, pending] = useActionState<PwState, FormData>(forgotPasswordAction, {});

  if (state.ok) {
    return (
      <div className="space-y-3 text-center">
        <div className="text-4xl">📧</div>
        <h1 className="font-serif text-2xl">{t("forgotSentTitle")}</h1>
        <p className="text-sm text-ink-secondary">{t("forgotSentBody")}</p>
        <Link href="/login" className="text-sm text-brand-purple-700 hover:underline">
          {t("toLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">{t("forgotTitle")}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("forgotBody")}</p>
      </div>
      <FormField label={t("email")} required>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </FormField>
      {state.code ? <p className="text-sm text-state-danger">{t("invalidEmail")}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("working") : t("forgotCta")}
      </Button>
      <Link href="/login" className="block text-center text-sm text-brand-purple-700 hover:underline">
        {t("toLogin")}
      </Link>
    </form>
  );
}
