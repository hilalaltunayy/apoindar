"use client";

import { useTransition, useState } from "react";
import { useTranslations } from "next-intl";
import { moderateProviderAction, resolveComplaintAction } from "@/lib/actions/admin";

export function ModerateButtons({ providerId }: { providerId: string }) {
  const t = useTranslations("admin");
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  if (done) return <span className="text-xs text-ink-tertiary">{done}</span>;
  return (
    <span className="flex gap-1.5">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await moderateProviderAction(providerId, "APPROVED");
            setDone(t("approved"));
          })
        }
        className="rounded-pill bg-state-success px-2.5 py-1 text-xs font-medium text-white"
      >
        {t("approve")}
      </button>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await moderateProviderAction(providerId, "REJECTED");
            setDone(t("rejected"));
          })
        }
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs"
      >
        {t("reject")}
      </button>
    </span>
  );
}

export function ResolveComplaintButtons({ id }: { id: string }) {
  const t = useTranslations("admin");
  const [pending, start] = useTransition();
  const [done, setDone] = useState<string | null>(null);
  if (done) return <span className="text-xs text-ink-tertiary">{done}</span>;
  return (
    <span className="flex gap-1.5">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await resolveComplaintAction(id, "APPROVED");
            setDone(t("upheld"));
          })
        }
        className="rounded-pill bg-brand-purple-600 px-2.5 py-1 text-xs font-medium text-white"
      >
        {t("uphold")}
      </button>
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            await resolveComplaintAction(id, "REJECTED");
            setDone(t("dismissed"));
          })
        }
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs"
      >
        {t("dismiss")}
      </button>
    </span>
  );
}
