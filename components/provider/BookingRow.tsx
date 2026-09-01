"use client";

import { useActionState, useState, useTransition } from "react";
import { refundBookingAction, type ActionResult } from "@/lib/actions/provider";
import { cancelBookingAction } from "@/lib/actions/booking";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";

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
            <Badge tone={p.status === "CONFIRMED" || p.status === "COMPLETED" ? "success" : p.status === "PENDING_PAYMENT" ? "yellow" : "neutral"}>
              {p.status.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {p.studentName}
            {p.scheduledAt
              ? ` · ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(p.scheduledAt))}`
              : ""}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{formatMoney(p.gross, p.currency)}</p>
          {p.providerNet != null ? (
            <p className="text-xs text-ink-tertiary">
              net {formatMoney(p.providerNet, p.currency)} · fee {formatMoney(p.commission ?? 0, p.currency)}
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
            {cancelPending ? "…" : "Cancel booking"}
          </button>
        )}
        {p.paymentId && p.refundable > 0 && (p.status === "CONFIRMED" || p.status === "COMPLETED") ? (
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-pill border border-line-soft px-3 py-1.5 text-xs"
          >
            {open ? "Close refund" : "Refund"}
          </button>
        ) : null}
      </div>

      {open && p.paymentId ? (
        <form action={action} className="mt-3 flex flex-wrap items-end gap-2 border-t border-line-soft pt-3">
          <input type="hidden" name="paymentId" value={p.paymentId} />
          <label className="text-xs">
            Amount (₺)
            <Input
              name="amount"
              type="number"
              min={1}
              max={Math.floor(p.refundable / 100)}
              defaultValue={Math.floor(p.refundable / 100)}
              className="mt-1 h-9 w-28"
            />
          </label>
          <Input name="reason" placeholder="Reason (optional)" className="h-9 flex-1" />
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "…" : "Process refund"}
          </Button>
          {state && !state.ok ? <p className="w-full text-xs text-state-danger">{state.error}</p> : null}
          {state?.ok ? <p className="w-full text-xs text-state-success">{state.message}</p> : null}
        </form>
      ) : null}
    </li>
  );
}
