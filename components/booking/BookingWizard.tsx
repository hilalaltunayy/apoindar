"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/Button";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { SuccessBurst } from "@/components/brand/SuccessBurst";
import { startBookingAction, payBookingAction } from "@/lib/actions/booking";
import { formatMoney } from "@/lib/money";

interface Slot {
  id: string;
  startsAt: string;
}
interface Props {
  listing: {
    id: string;
    title: string;
    kind: "SINGLE_LESSON" | "PACKAGE";
    priceAmount: number;
    currency: string;
    durationMin: number;
    lessonCount: number;
  };
  providerName: string;
  slots: Slot[];
  cancellationPolicy: string;
}

type Step = "time" | "review" | "pay" | "done";

export function BookingWizard({ listing, providerName, slots, cancellationPolicy }: Props) {
  const router = useRouter();
  const t = useTranslations("booking");
  const common = useTranslations("common");
  const locale = useLocale();
  const dtLong = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dtShort = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const [step, setStep] = useState<Step>(slots.length ? "time" : "review");
  const [slotId, setSlotId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const idem = useMemo(() => crypto.randomUUID(), []);

  const STEPS: { key: Step; label: string }[] = [
    { key: "time", label: t("stepTime") },
    { key: "review", label: t("stepReview") },
    { key: "pay", label: t("stepPayment") },
    { key: "done", label: t("stepDone") },
  ];

  const chosenSlot = slots.find((s) => s.id === slotId);
  const kindLabel = listing.kind === "PACKAGE" ? common("package") : common("singleLesson");

  function createBooking() {
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("listingId", listing.id);
      if (slotId) fd.set("availabilitySlotId", slotId);
      fd.set("idempotencyKey", idem);
      const res = await startBookingAction(null, fd);
      if (!res.ok) return setError(res.error);
      setBookingId(res.bookingId);
      setStep("pay");
    });
  }

  function pay() {
    if (!bookingId) return;
    setError(null);
    start(async () => {
      const fd = new FormData();
      fd.set("bookingId", bookingId);
      fd.set("idempotencyKey", `pay_${idem}`);
      const res = await payBookingAction(null, fd);
      if (!res.ok) return setError(res.error);
      setStep("done");
    });
  }

  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="card-surface p-6 shadow-raised">
      <ol className="mb-6 flex items-center gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-pill font-medium ${
                i <= activeIndex
                  ? "bg-brand-purple-600 text-white"
                  : "bg-brand-lavender-100 text-brand-purple-700"
              }`}
            >
              {i + 1}
            </span>
            <span className={i === activeIndex ? "font-medium" : "text-ink-tertiary"}>{s.label}</span>
            {i < STEPS.length - 1 ? <span className="mx-1 h-px w-5 bg-line-soft" /> : null}
          </li>
        ))}
      </ol>

      {pending ? <BrandLoader label={step === "pay" ? t("processing") : t("working")} /> : null}

      {!pending && step === "time" ? (
        <div>
          <h2 className="text-lg font-semibold">{t("chooseTime")}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {slots.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlotId(s.id)}
                className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                  slotId === s.id
                    ? "border-brand-purple-500 bg-brand-lavender-100"
                    : "border-line-soft hover:bg-brand-lavender-100/60"
                }`}
              >
                {dtShort.format(new Date(s.startsAt))}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={() => setStep("review")} disabled={!slotId}>
              {common("continue")}
            </Button>
          </div>
        </div>
      ) : null}

      {!pending && step === "review" ? (
        <div>
          <h2 className="text-lg font-semibold">{t("reviewTitle")}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k={t("rowTeacher")} v={providerName} />
            <Row k={listing.kind === "PACKAGE" ? t("rowPackage") : t("rowLesson")} v={listing.title} />
            {listing.kind === "PACKAGE" ? <Row k={t("rowLessons")} v={`${listing.lessonCount}`} /> : null}
            <Row k={t("rowDuration")} v={`${listing.durationMin} ${common("minutes")}`} />
            <Row
              k={t("rowTime")}
              v={chosenSlot ? dtLong.format(new Date(chosenSlot.startsAt)) : t("timeToArrange")}
            />
            <div className="flex justify-between border-t border-line-soft pt-2 text-base font-semibold">
              <span>{t("total")}</span>
              <span>{formatMoney(listing.priceAmount, listing.currency)}</span>
            </div>
          </dl>
          <p className="mt-3 rounded-md bg-brand-lavender-100/60 p-3 text-xs text-ink-secondary">
            {cancellationPolicy}
          </p>
          {error ? <p className="mt-3 text-sm text-state-danger">{error}</p> : null}
          <div className="mt-5 flex justify-between">
            {slots.length ? (
              <Button variant="ghost" onClick={() => setStep("time")}>
                {common("back")}
              </Button>
            ) : (
              <span />
            )}
            <Button onClick={createBooking}>{t("continuePayment")}</Button>
          </div>
        </div>
      ) : null}

      {!pending && step === "pay" ? (
        <div>
          <h2 className="text-lg font-semibold">{t("paymentTitle")}</h2>
          <p className="mt-1 text-sm text-ink-secondary">{t("paymentSecureNote")}</p>
          <div className="mt-4 flex items-center justify-between rounded-md border border-line-soft p-4">
            <span className="text-sm">{t("amountDue")}</span>
            <span className="text-lg font-semibold">
              {formatMoney(listing.priceAmount, listing.currency)}
            </span>
          </div>
          {error ? <p className="mt-3 text-sm text-state-danger">{error}</p> : null}
          <div className="mt-5 flex justify-end">
            <Button onClick={pay}>
              {t("pay", { amount: formatMoney(listing.priceAmount, listing.currency) })}
            </Button>
          </div>
        </div>
      ) : null}

      {!pending && step === "done" ? (
        <div className="text-center">
          <SuccessBurst />
          <h2 className="mt-2 font-serif text-2xl">{t("confirmedTitle")}</h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {t("confirmedBody", { kind: kindLabel.toLowerCase(), name: providerName })}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Button href="/bookings">{t("viewBookings")}</Button>
            <Button variant="secondary" onClick={() => router.push("/search")}>
              {t("findAnother")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-tertiary">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
