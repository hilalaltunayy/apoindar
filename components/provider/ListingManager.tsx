"use client";

import { useActionState, useState, useTransition } from "react";
import { createListingAction, toggleListingAction, type ActionResult } from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, FormField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";

interface ListingRow {
  id: string;
  title: string;
  kind: "SINGLE_LESSON" | "PACKAGE";
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  priceAmount: number;
  currency: string;
  lessonCount: number;
  durationMin: number;
  bookings: number;
}

const CATEGORIES = [
  ["", "No category"],
  ["academic", "Academic"],
  ["languages", "Languages"],
  ["sports", "Sports"],
  ["music", "Music"],
  ["art-design", "Art & Design"],
  ["exam-prep", "Exam Preparation"],
] as const;

export function ListingManager({
  listings,
  canActivateMore,
  planLabel,
}: {
  listings: ListingRow[];
  canActivateMore: boolean;
  planLabel: string;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createListingAction,
    null,
  );
  const [kind, setKind] = useState<"SINGLE_LESSON" | "PACKAGE">("SINGLE_LESSON");

  return (
    <div className="space-y-6">
      {listings.length ? (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex flex-col gap-3 rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{l.title}</p>
                  <Badge tone={l.status === "ACTIVE" ? "success" : l.status === "DRAFT" ? "yellow" : "neutral"}>
                    {l.status.toLowerCase()}
                  </Badge>
                  <Badge tone="neutral">
                    {l.kind === "PACKAGE" ? `${l.lessonCount}-lesson package` : "Single lesson"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {formatMoney(l.priceAmount, l.currency)} · {l.durationMin} min · {l.bookings} bookings
                </p>
              </div>
              <ToggleButton id={l.id} active={l.status === "ACTIVE"} canActivate={canActivateMore} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="📋" title="No lessons or packages yet" description="Create your first offer below." />
      )}

      <Disclosure label="+ Create a lesson or package" defaultOpen={!listings.length}>
        <form action={action} className="space-y-4">
          <FormField label="Type">
            {(p) => (
              <Select
                {...p}
                name="kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="SINGLE_LESSON">Single lesson</option>
                <option value="PACKAGE">Package (multiple lessons)</option>
              </Select>
            )}
          </FormField>
          <FormField label="Title" required>
            {(p) => <Input {...p} name="title" required placeholder="e.g. 1-on-1 Physics lesson" />}
          </FormField>
          <FormField label="Description">
            {(p) => <Textarea {...p} name="description" placeholder="What students can expect…" />}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Price (₺)" required>
              {(p) => <Input {...p} name="priceAmount" type="number" min={1} step={10} required />}
            </FormField>
            <FormField label="Duration (min)" required>
              {(p) => <Input {...p} name="durationMin" type="number" min={15} max={480} defaultValue={60} required />}
            </FormField>
          </div>
          {kind === "PACKAGE" ? (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Lessons in package" required>
                {(p) => <Input {...p} name="lessonCount" type="number" min={2} max={100} defaultValue={8} required />}
              </FormField>
              <FormField label="Package terms">
                {(p) => <Input {...p} name="packageTerms" placeholder="Use within 3 months" />}
              </FormField>
            </div>
          ) : (
            <input type="hidden" name="lessonCount" value={1} />
          )}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Format">
              {(p) => (
                <Select {...p} name="deliveryMode" defaultValue="BOTH">
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In person</option>
                  <option value="BOTH">Both</option>
                </Select>
              )}
            </FormField>
            <FormField label="Category">
              {(p) => (
                <Select {...p} name="categorySlug" defaultValue="">
                  {CATEGORIES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              )}
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="activate" defaultChecked={canActivateMore} disabled={!canActivateMore} />
            Publish immediately
            {!canActivateMore ? (
              <span className="text-xs text-ink-tertiary">({planLabel} — save as draft, upgrade to activate more)</span>
            ) : null}
          </label>

          <PriceHint />

          {state && !state.ok ? <p className="text-sm text-state-danger">{state.error}</p> : null}
          {state?.ok ? <p className="text-sm text-state-success">{state.message}</p> : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create"}
          </Button>
        </form>
      </Disclosure>
    </div>
  );
}

/** Price is entered in whole ₺; the server expects minor units. Convert on submit. */
function PriceHint() {
  return (
    <p className="text-xs text-ink-tertiary">
      Enter the price in whole Turkish lira. Students pay exactly this — Apoindar adds no fee for them.
    </p>
  );
}

function ToggleButton({
  id,
  active,
  canActivate,
}: {
  id: string;
  active: boolean;
  canActivate: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        disabled={pending || (!active && !canActivate)}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await toggleListingAction(id, !active);
            if (!res.ok) setError(res.error);
          })
        }
        className={`rounded-pill px-3 py-1.5 text-xs font-semibold ${
          active
            ? "border border-line-soft text-ink-secondary"
            : "bg-brand-yellow-500 text-ink-primary disabled:opacity-50"
        }`}
      >
        {pending ? "…" : active ? "Deactivate" : "Activate"}
      </button>
      {error ? <span className="max-w-[12rem] text-right text-xs text-state-danger">{error}</span> : null}
    </div>
  );
}
