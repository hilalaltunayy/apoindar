"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cancelBookingAction } from "@/lib/actions/booking";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const t = useTranslations("studentBookings");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-pill border border-line-soft px-3 py-1.5 text-xs text-ink-secondary hover:border-state-danger hover:text-state-danger"
      >
        {t("cancel")}
      </button>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs">
      {error ? <span className="text-state-danger">{error}</span> : <span>{t("cancelSure")}</span>}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await cancelBookingAction(bookingId);
            if (!res.ok) setError(res.error);
            else router.refresh();
          })
        }
        className="rounded-pill bg-state-danger px-2.5 py-1 font-medium text-white"
      >
        {pending ? "…" : t("cancelConfirm")}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-pill border border-line-soft px-2.5 py-1"
      >
        {t("keepIt")}
      </button>
    </span>
  );
}
