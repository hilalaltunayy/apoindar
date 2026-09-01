"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signupAction, loginAction, type FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";

const initial: FormState = {};

export function SignupForm() {
  const params = useSearchParams();
  const presetProvider = params.get("role") === "provider";
  const [state, action, pending] = useActionState(signupAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Create your account</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Students pay no platform fee. Teachers start free.
        </p>
      </div>

      <fieldset className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line-soft p-3 text-sm has-[:checked]:border-brand-purple-500 has-[:checked]:bg-brand-lavender-100">
          <input type="radio" name="role" value="STUDENT" defaultChecked={!presetProvider} />
          I want to learn
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-line-soft p-3 text-sm has-[:checked]:border-brand-purple-500 has-[:checked]:bg-brand-lavender-100">
          <input type="radio" name="role" value="PROVIDER" defaultChecked={presetProvider} />
          I want to teach
        </label>
      </fieldset>

      <FormField label="Full name" required error={state.fieldErrors?.name?.[0]}>
        {(p) => <Input {...p} name="name" autoComplete="name" required />}
      </FormField>
      <FormField label="Email" required error={state.fieldErrors?.email?.[0]}>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </FormField>
      <FormField
        label="Password"
        required
        hint="At least 8 characters."
        error={state.fieldErrors?.password?.[0]}
      >
        {(p) => (
          <Input {...p} name="password" type="password" autoComplete="new-password" required minLength={8} />
        )}
      </FormField>

      {state.error ? <p className="text-sm text-state-danger">{state.error}</p> : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink-secondary">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-purple-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-secondary">Log in to keep learning.</p>
      </div>
      <input type="hidden" name="next" value={next} />
      <FormField label="Email" required>
        {(p) => <Input {...p} name="email" type="email" autoComplete="email" required />}
      </FormField>
      <FormField label="Password" required>
        {(p) => (
          <Input {...p} name="password" type="password" autoComplete="current-password" required />
        )}
      </FormField>
      {state.error ? <p className="text-sm text-state-danger">{state.error}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-center text-sm text-ink-secondary">
        New to Apoindar?{" "}
        <Link href="/signup" className="font-medium text-brand-purple-700 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
