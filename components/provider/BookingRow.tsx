"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { refundBookingAction, type ActionResult } from "@/lib/actions/provider";
import { cancelBookingAction } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { statusLabel } from "@/lib/i18n/labels";
import { useActionError } from "@/lib/i18n/action-error";

interface Props {
  id: string;
  paymentId?: string;
  title: string;
  studentName: string;
  studentEmail?: string;
  scheduledAt?: string;
  status: string;
  gross: number;
  currency: string;
  paymentStatus?: string;
  providerNet?: number;
  commission?: number;
  refundable: number;
}

export function BookingRow(p: Props) {
  const t = useTranslations("providerBookings");
  const st = useTranslations("statusLabels");
  const errText = useActionError();
  const locale = useLocale();
  const df = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    refundBookingAction,
    null,
  );
  const [cancelPending, startCancel] = useTransition();

  return (
    <li className="rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{p.title}</p>
            <Badge
              tone={
                p.status === "CONFIRMED" || p.status === "COMPLETED"
                  ? "success"
                  : p.status === "PENDING_PAYMENT"
                    ? "yellow"
                    : "neutral"
              }
            >
              {statusLabel(p.status, st)}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {p.studentName}
            {p.scheduledAt ? ` · ${df.format(new Date(p.scheduledAt))}` : ""}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{formatMoney(p.gross, p.currency)}</p>
          {p.providerNet != null ? (
            <p className="text-xs text-ink-tertiary">
              {t("netFee", {
                net: formatMoney(p.providerNet, p.currency),
                fee: formatMoney(p.commission ?? 0, p.currency),
              })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {(p.status === "CONFIRMED" || p.status === "PENDING_PAYMENT") && (
          <button
            disabled={cancelPending}
            onClick={() => startCancel(() => cancelBookingAction(p.id).then(() => undefined))}
            className="rounded-pill border border-line-soft px-3 py-1.5 text-xs hover:border-state-danger hover:text-state-danger"
          >
            {cancelPending ? "…" : t("cancelBooking")}
          </button>
        )}
        {p.paymentId &&
        p.refundable > 0 &&
        (p.status === "CONFIRMED" || p.status === "COMPLETED") ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-pill border border-line-soft px-3 py-1.5 text-xs"
          >
            {open ? t("closeRefund") : t("refund")}
          </button>
        ) : null}
      </div>

      {open && p.paymentId ? (
        <form
          action={action}
          className="mt-3 flex flex-wrap items-end gap-2 border-t border-line-soft pt-3"
        >
          <input type="hidden" name="paymentId" value={p.paymentId} />
          <label className="text-xs">
            {t("amountLira")}
            <Input
              name="amount"
              type="number"
              min={1}
              max={Math.floor(p.refundable / 100)}
              defaultValue={Math.floor(p.refundable / 100)}
              className="mt-1 h-9 w-28"
            />
          </label>
          <Input name="reason" placeholder={t("reasonOptional")} className="h-9 flex-1" />
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "…" : t("processRefund")}
          </Button>
          {state && !state.ok ? (
            <p className="w-full text-xs text-state-danger">{errText(state)}</p>
          ) : null}
          {state?.ok ? <p className="w-full text-xs text-state-success">{t("refundDone")}</p> : null}
        </form>
      ) : null}
    </li>
  );
}
