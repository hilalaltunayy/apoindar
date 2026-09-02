"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  saveProviderProfileAction,
  publishProviderAction,
  type ActionResult,
} from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select, FormField } from "@/components/ui/Field";
import { useActionError } from "@/lib/i18n/action-error";

const CATEGORY_SLUGS = ["academic", "languages", "sports", "music", "art-design", "exam-prep"] as const;

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
  const t = useTranslations("onboarding");
  const common = useTranslations("common");
  const tn = useTranslations("categoriesPage.names");
  const errText = useActionError();
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
        {[t("stepProfile"), t("stepCategories"), t("stepLessons"), t("stepPublish")].map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-pill bg-brand-lavender-200 text-brand-purple-700">
              {i + 1}
            </span>
            {s}
          </li>
        ))}
      </ol>

      <form action={action} className="space-y-5">
        <h2 className="text-lg font-semibold">{t("section1")}</h2>
        <FormField label={t("displayName")} required>
          {(p) => <Input {...p} name="displayName" defaultValue={initial.displayName} required />}
        </FormField>
        <FormField label={t("headline")} hint={t("headlineHint")}>
          {(p) => (
            <Input
              {...p}
              name="headline"
              defaultValue={initial.headline ?? ""}
              placeholder={t("headlinePlaceholder")}
            />
          )}
        </FormField>
        <FormField label={t("aboutYou")}>
          {(p) => <Textarea {...p} name="bio" defaultValue={initial.bio ?? ""} />}
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("city")}>
            {(p) => <Input {...p} name="city" defaultValue={initial.city ?? ""} />}
          </FormField>
          <FormField label={t("district")}>
            {(p) => <Input {...p} name="district" defaultValue={initial.district ?? ""} />}
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("format")}>
            {(p) => (
              <Select {...p} name="deliveryMode" defaultValue={initial.deliveryMode}>
                <option value="ONLINE">{common("online")}</option>
                <option value="IN_PERSON">{common("inPerson")}</option>
                <option value="BOTH">{common("onlineAndInPerson")}</option>
              </Select>
            )}
          </FormField>
          <FormField label={t("yearsExperience")}>
            {(p) => (
              <Input
                {...p}
                name="yearsExperience"
                type="number"
                min={0}
                max={70}
                defaultValue={initial.yearsExperience ?? ""}
              />
            )}
          </FormField>
        </div>

        <h2 className="pt-2 text-lg font-semibold">{t("section2")}</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_SLUGS.map((slug) => {
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
                {tn(slug)}
              </button>
            );
          })}
        </div>
        {cats.map((c) => (
          <input key={c} type="hidden" name="categorySlugs" value={c} />
        ))}

        {state && !state.ok ? <p className="text-sm text-state-danger">{errText(state)}</p> : null}
        {state?.ok ? <p className="text-sm text-state-success">{t("profileSaved")}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? common("saving") : t("saveProfile")}
        </Button>
      </form>

      <div className="rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
        <h2 className="text-lg font-semibold">{t("section3")}</h2>
        <p className="mt-1 text-sm text-ink-secondary">{t("section3Body")}</p>
        <Button href="/provider/listings" variant="secondary" className="mt-3">
          {hasActiveListing ? t("manageLessons") : t("addLesson")}
        </Button>
      </div>

      <div className="rounded-lg border border-brand-purple-200 bg-brand-lavender-100/50 p-5">
        <h2 className="text-lg font-semibold">{t("section4")}</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          {published ? t("publishedBody") : hasActiveListing ? t("readyBody") : t("notReadyBody")}
        </p>
        <Button
          className="mt-3"
          disabled={!hasActiveListing || publishing || published}
          onClick={() =>
            startPublish(async () => {
              await publishProviderAction();
              router.push("/provider");
            })
          }
        >
          {published ? t("published") : publishing ? t("publishing") : t("publishCta")}
        </Button>
      </div>
    </div>
  );
}
