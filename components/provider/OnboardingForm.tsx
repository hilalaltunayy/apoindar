"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  saveProviderProfileAction,
  publishProviderAction,
  type ActionResult,
} from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, FormField } from "@/components/ui/Field";

const CATEGORIES = [
  ["academic", "Academic"],
  ["languages", "Languages"],
  ["sports", "Sports"],
  ["music", "Music"],
  ["art-design", "Art & Design"],
  ["exam-prep", "Exam Preparation"],
] as const;

export function OnboardingForm({
  initial,
  hasActiveListing,
  published,
}: {
  initial: {
    displayName: string;
    headline: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
    yearsExperience: number | null;
    categorySlugs: string[];
  };
  hasActiveListing: boolean;
  published: boolean;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveProviderProfileAction,
    null,
  );
  const [cats, setCats] = useState<string[]>(initial.categorySlugs);
  const [publishing, startPublish] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <ol className="flex flex-wrap gap-2 text-xs text-ink-tertiary">
        {["Profile", "Categories", "Lessons", "Publish"].map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-brand-lavender-200 text-brand-purple-700">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <form action={action} className="space-y-5">
        <h2 className="text-lg font-semibold">1 · Your profile</h2>
        <FormField label="Display name" required>
          {(p) => <Input {...p} name="displayName" defaultValue={initial.displayName} required />}
        </FormField>
        <FormField label="Headline" hint="One line students see first.">
          {(p) => (
            <Input {...p} name="headline" defaultValue={initial.headline ?? ""} placeholder="Physics & Maths tutor · 8 years" />
          )}
        </FormField>
        <FormField label="About you">
          {(p) => <Textarea {...p} name="bio" defaultValue={initial.bio ?? ""} />}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="City">
            {(p) => <Input {...p} name="city" defaultValue={initial.city ?? ""} />}
          </FormField>
          <FormField label="District">
            {(p) => <Input {...p} name="district" defaultValue={initial.district ?? ""} />}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Format">
            {(p) => (
              <Select {...p} name="deliveryMode" defaultValue={initial.deliveryMode}>
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In person</option>
                <option value="BOTH">Both</option>
              </Select>
            )}
          </FormField>
          <FormField label="Years of experience">
            {(p) => (
              <Input {...p} name="yearsExperience" type="number" min={0} max={70} defaultValue={initial.yearsExperience ?? ""} />
            )}
          </FormField>
        </div>

        <h2 className="pt-2 text-lg font-semibold">2 · Categories</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(([slug, label]) => {
            const on = cats.includes(slug);
            return (
              <button
                type="button"
                key={slug}
                onClick={() => setCats((c) => (on ? c.filter((x) => x !== slug) : [...c, slug]))}
                className={`rounded-pill px-3 py-1.5 text-sm ${
                  on ? "bg-brand-purple-600 text-white" : "bg-brand-lavender-100 text-brand-purple-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {cats.map((c) => (
          <input key={c} type="hidden" name="categorySlugs" value={c} />
        ))}

        {state && !state.ok ? <p className="text-sm text-state-danger">{state.error}</p> : null}
        {state?.ok ? <p className="text-sm text-state-success">{state.message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <div className="rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
        <h2 className="text-lg font-semibold">3 · Lessons &amp; packages</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Add at least one active lesson or package so students can book you.
        </p>
        <Button href="/provider/listings" variant="secondary" className="mt-3">
          {hasActiveListing ? "Manage lessons" : "Add a lesson"}
        </Button>
      </div>

      <div className="rounded-lg border border-brand-purple-200 bg-brand-lavender-100/50 p-5">
        <h2 className="text-lg font-semibold">4 · Publish</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {published
            ? "Your profile is live. You can keep editing anytime."
            : hasActiveListing
              ? "You're ready. Publishing makes your profile discoverable in search."
              : "Add an active lesson first, then publish."}
        </p>
        <Button
          className="mt-3"
          disabled={!hasActiveListing || publishing || published}
          onClick={() => startPublish(async () => {
            await publishProviderAction();
            router.push("/provider");
          })}
        >
          {published ? "Published" : publishing ? "Publishing…" : "Publish my profile"}
        </Button>
      </div>
    </div>
  );
}
