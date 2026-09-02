"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  subscribeAction,
  cancelSubscriptionAction,
  type ActionResult,
} from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { SuccessBurst } from "@/components/brand/SuccessBurst";
import { useActionError } from "@/lib/i18n/action-error";

export function PremiumCta({
  state: planState,
}: {
  state: "anon" | "student" | "free-provider" | "premium" | "trialing";
}) {
  const t = useTranslations("premium");
  const errText = useActionError();
  const [result, action, pending] = useActionState<ActionResult | null, FormData>(
    subscribeAction,
    null,
  );
  const [interval, setInterval] = useState<"MONTH" | "YEAR">("MONTH");

  if (result?.ok) {
    return (
      <div className="rounded-xl border border-brand-purple-200 bg-brand-lavender-100/50 p-6 text-center">
        <SuccessBurst />
        <p className="mt-2 font-serif text-xl">{t("activeMessage")}</p>
        <Button href="/provider" className="mt-4">
          {t("goToDashboard")}
        </Button>
      </div>
    );
  }

  if (planState === "anon") {
    return (
      <Button href="/signup?role=provider" size="lg">
        {t("ctaStartTeaching")}
      </Button>
    );
  }
  if (planState === "student") {
    return (
      <p className="text-sm text-ink-secondary">
        {t("ctaStudentNote")}{" "}
        <a href="/signup?role=provider" className="text-brand-purple-700 underline">
          {t("ctaStartTeaching")}
        </a>
      </p>
    );
  }
  if (planState === "premium" || planState === "trialing") {
    return (
      <form
        action={async () => {
          await cancelSubscriptionAction();
        }}
      >
        <p className="mb-2 text-sm text-state-success">
          {planState === "trialing" ? t("ctaTrialActive") : t("ctaActive")}
        </p>
        <button className="rounded-pill border border-line-soft px-4 py-2 text-sm">
          {t("ctaCancel")}
        </button>
      </form>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="inline-flex rounded-pill border border-line-soft p-1 text-sm">
        {(["MONTH", "YEAR"] as const).map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInterval(i)}
            className={`rounded-pill px-4 py-1.5 ${
              interval === i ? "bg-brand-purple-600 text-white" : ""
            }`}
          >
            {i === "MONTH" ? t("billingMonthly") : t("billingAnnual")}
          </button>
        ))}
      </div>
      <input type="hidden" name="interval" value={interval} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="mode" value="trial" size="lg" disabled={pending}>
          {pending ? "…" : t("startTrial")}
        </Button>
        <Button type="submit" name="mode" value="paid" variant="secondary" size="lg" disabled={pending}>
          {t("subscribeNow")}
        </Button>
      </div>
      <p className="text-xs text-ink-tertiary">{t("trialNote")}</p>
      {result && !result.ok ? (
        <p className="text-sm text-state-danger">{errText(result)}</p>
      ) : null}
    </form>
  );
}
