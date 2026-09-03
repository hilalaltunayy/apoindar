"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signupAction, loginAction, type FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";
import { PasswordInput } from "@/components/ui/PasswordInput";

const initial: FormState = {};

function useErrorText() {
  const t = useTranslations("auth");
  return (state: FormState): string | undefined => {
    switch (state.code) {
      case "EMAIL_EXISTS":
        return t("errorExists");
      case "CREATED_LOGIN":
        return t("errorCreatedLogin");
      case "WRONG_CREDENTIALS":
        return t("errorWrongCredentials");
      case "INVALID_LOGIN":
      case "INVALID_SIGNUP":
        return t("errorInvalidLogin");
      case "UNKNOWN":
        return t("errorInvalidLogin");
      default:
        return undefined;
    }
  };
}

export function SignupForm() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const presetProvider = params.get("role") === "provider";
  const [state, action, pending] = useActionState(signupAction, initial);
  const errorText = useErrorText();
  const err = errorText(state);
  const fieldErr = (name: string) =>
    state.fields?.includes(name) ? t("errorInvalidLogin") : undefined;

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">{t("signupTitle")}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("signupSubtitle")}</p>
      </div>

      <fieldset className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line-soft p-3 text-sm has-[:checked]:border-brand-purple-500 has-[:checked]:bg-brand-lavender-100">
          <input type="radio" name="role" value="STUDENT" defaultChecked={!presetProvider} />
          {t("roleStudent")}
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line-soft p-3 text-sm has-[:checked]:border-brand-purple-500 has-[:checked]:bg-brand-lavender-100">
          <input type="radio" name="role" value="PROVIDER" defaultChecked={presetProvider} />
          {t("roleTeacher")}
        </label>
      </fieldset>

      <FormField label={t("fullName")} required error={fieldErr("name")}>
        {(p) => <Input {...p} name="name" autoComplete="name" required />}
      </FormField>
      <FormField label={t("email")} required error={fieldErr("email")}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </FormField>
      <FormField label={t("password")} required hint={t("passwordHint")} error={fieldErr("password")}>
        {(p) => (
          <PasswordInput {...p} name="password" autoComplete="new-password" required minLength={8} />
        )}
      </FormField>

      {err ? <p className="text-sm text-state-danger">{err}</p> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("creating") : t("createAccount")}
      </Button>
      <p className="text-center text-sm text-ink-secondary">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-brand-purple-700 hover:underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [state, action, pending] = useActionState(loginAction, initial);
  const errorText = useErrorText();
  const err = errorText(state);

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">{t("loginTitle")}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{t("loginSubtitle")}</p>
      </div>
      <input type="hidden" name="next" value={next} />
      <FormField label={t("email")} required>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </FormField>
      <FormField label={t("password")} required>
        {(p) => <PasswordInput {...p} name="password" autoComplete="current-password" required />}
      </FormField>
      {err ? <p className="text-sm text-state-danger">{err}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("loggingIn") : t("logIn")}
      </Button>
      <p className="text-center text-sm text-ink-secondary">
        {t("newHere")}{" "}
        <Link href="/signup" className="font-medium text-brand-purple-700 hover:underline">
          {t("signupLink")}
        </Link>
      </p>
    </form>
  );
}
