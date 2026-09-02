"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import {
  addStudentAction,
  setStudentStatusAction,
  addStudentNoteAction,
  type ActionResult,
} from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, FormField } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { Disclosure } from "@/components/ui/Disclosure";
import { EmptyState } from "@/components/ui/EmptyState";
import { statusLabel } from "@/lib/i18n/labels";
import { useActionError } from "@/lib/i18n/action-error";

interface StudentRow {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "FORMER";
  labelColor: string | null;
  lessons: number;
  bookings: number;
  lastListing?: string;
  notes: { id: string; body: string; createdAt: string }[];
}

export function StudentManager({
  students,
  canAddActive,
  advancedCrm,
  freeLimitReached,
}: {
  students: StudentRow[];
  canAddActive: boolean;
  advancedCrm: boolean;
  freeLimitReached: boolean;
}) {
  const t = useTranslations("crm");
  const st = useTranslations("statusLabels");
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addStudentAction,
    null,
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "FORMER">("ALL");

  const visible = students.filter(
    (s) =>
      (filter === "ALL" || s.status === filter) &&
      (!advancedCrm || s.fullName.toLowerCase().includes(query.toLowerCase())),
  );

  const filterLabel = (f: string) =>
    f === "ALL"
      ? t("filterAll")
      : f === "ACTIVE"
        ? t("filterActive")
        : f === "INACTIVE"
          ? t("filterInactive")
          : t("filterFormer");

  return (
    <div className="space-y-6">
      {advancedCrm ? (
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          {(["ALL", "ACTIVE", "INACTIVE", "FORMER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-pill px-3 py-1 text-xs font-medium ${
                filter === f
                  ? "bg-brand-purple-600 text-white"
                  : "bg-brand-lavender-100 text-brand-purple-700"
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>
      ) : null}

      {visible.length ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((s) => (
            <li key={s.id} className="rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {s.labelColor ? (
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.labelColor }} />
                  ) : null}
                  <p className="font-medium">{s.fullName}</p>
                </div>
                <Badge tone={s.status === "ACTIVE" ? "success" : "neutral"}>
                  {statusLabel(s.status, st)}
                </Badge>
              </div>
              {(s.email || s.phone) && advancedCrm ? (
                <p className="mt-1 text-xs text-ink-tertiary">
                  {[s.email, s.phone].filter(Boolean).join(" · ")}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-ink-secondary">
                {t("lessonsBookings", { lessons: s.lessons, bookings: s.bookings })}
                {s.lastListing ? ` · ${s.lastListing}` : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["ACTIVE", "INACTIVE", "FORMER"] as const)
                  .filter((x) => x !== s.status)
                  .map((x) => (
                    <StatusButton
                      key={x}
                      id={s.id}
                      status={x}
                      label={t("setStatus", { status: statusLabel(x, st) })}
                      disabled={x === "ACTIVE" && !canAddActive}
                    />
                  ))}
              </div>

              {advancedCrm ? (
                <NotesBlock studentId={s.id} notes={s.notes} />
              ) : (
                <p className="mt-3 text-xs text-ink-tertiary">{t("notesPremiumOnly")}</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="🧑‍🎓" title={t("noneTitle")} description={t("noneBody")} />
      )}

      <Disclosure label={t("addCta")} defaultOpen={!students.length}>
        {freeLimitReached ? (
          <p className="text-sm text-ink-secondary">{t("freeLimitBody")}</p>
        ) : (
          <form action={action} className="space-y-3">
            <FormField label={t("fullName")} required>
              {(p) => <Input {...p} name="fullName" required />}
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={t("email")}>{(p) => <Input {...p} name="email" type="email" />}</FormField>
              <FormField label={t("phone")}>{(p) => <Input {...p} name="phone" />}</FormField>
            </div>
            {advancedCrm ? (
              <FormField label={t("labelColour")}>
                {(p) => (
                  <input
                    {...p}
                    name="labelColor"
                    type="color"
                    defaultValue="#7450A6"
                    className="h-10 w-16 rounded-md border border-line-soft"
                  />
                )}
              </FormField>
            ) : null}
            {state && !state.ok ? (
              <p className="text-sm text-state-danger">{errText(state)}</p>
            ) : null}
            {state?.ok ? <p className="text-sm text-state-success">{t("added")}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? t("adding") : t("addStudent")}
            </Button>
          </form>
        )}
      </Disclosure>
    </div>
  );
}

function StatusButton({
  id,
  status,
  label,
  disabled,
}: {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "FORMER";
  label: string;
  disabled?: boolean;
}) {
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    setStudentStatusAction,
    null,
  );
  return (
    <form action={action} className="contents">
      <input type="hidden" name="studentId" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={pending || disabled}
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs disabled:opacity-40"
      >
        {pending ? "…" : label}
      </button>
      {state && !state.ok ? (
        <span className="w-full text-xs text-state-danger">{errText(state)}</span>
      ) : null}
    </form>
  );
}

function NotesBlock({
  studentId,
  notes,
}: {
  studentId: string;
  notes: { id: string; body: string; createdAt: string }[];
}) {
  const t = useTranslations("crm");
  const common = useTranslations("common");
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addStudentNoteAction,
    null,
  );
  return (
    <div className="mt-3 border-t border-line-soft pt-3">
      {notes.length ? (
        <ul className="mb-2 space-y-1">
          {notes.map((n) => (
            <li key={n.id} className="text-xs text-ink-secondary">
              • {n.body}
            </li>
          ))}
        </ul>
      ) : null}
      <form action={action} className="flex gap-2">
        <input type="hidden" name="studentId" value={studentId} />
        <Textarea
          name="body"
          placeholder={t("notePlaceholder")}
          className="min-h-[2.5rem] flex-1 text-xs"
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {common("add")}
        </Button>
      </form>
      {state && !state.ok ? (
        <p className="mt-1 text-xs text-state-danger">{errText(state)}</p>
      ) : null}
    </div>
  );
}
