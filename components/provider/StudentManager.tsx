"use client";

import { useActionState, useState, useTransition } from "react";
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
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(addStudentAction, null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "FORMER">("ALL");

  const visible = students.filter(
    (s) =>
      (filter === "ALL" || s.status === filter) &&
      (!advancedCrm || s.fullName.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {advancedCrm ? (
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search students…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-xs"
          />
          {(["ALL", "ACTIVE", "INACTIVE", "FORMER"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-pill px-3 py-1 text-xs font-medium ${
                filter === f ? "bg-brand-purple-600 text-white" : "bg-brand-lavender-100 text-brand-purple-700"
              }`}
            >
              {f.toLowerCase()}
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
                <Badge tone={s.status === "ACTIVE" ? "success" : "neutral"}>{s.status.toLowerCase()}</Badge>
              </div>
              {(s.email || s.phone) && advancedCrm ? (
                <p className="mt-1 text-xs text-ink-tertiary">{[s.email, s.phone].filter(Boolean).join(" · ")}</p>
              ) : null}
              <p className="mt-1 text-xs text-ink-secondary">
                {s.lessons} lessons · {s.bookings} bookings
                {s.lastListing ? ` · ${s.lastListing}` : ""}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(["ACTIVE", "INACTIVE", "FORMER"] as const)
                  .filter((st) => st !== s.status)
                  .map((st) => (
                    <StatusButton key={st} id={s.id} status={st} disabled={st === "ACTIVE" && !canAddActive} />
                  ))}
              </div>

              {advancedCrm ? (
                <NotesBlock studentId={s.id} notes={s.notes} />
              ) : (
                <p className="mt-3 text-xs text-ink-tertiary">Private notes are a Premium feature.</p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState glyph="🧑‍🎓" title="No students here" description="Add a student to start tracking their lessons." />
      )}

      <Disclosure label="+ Add a student" defaultOpen={!students.length}>
        {freeLimitReached ? (
          <p className="text-sm text-ink-secondary">
            You’ve reached the Free limit of 3 active students. Set one to inactive, or{" "}
            <a href="/premium" className="text-brand-purple-700 underline">
              upgrade to Premium
            </a>{" "}
            for unlimited students. Existing student data is always kept.
          </p>
        ) : (
          <form action={action} className="space-y-3">
            <FormField label="Full name" required>
              {(p) => <Input {...p} name="fullName" required />}
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Email">{(p) => <Input {...p} name="email" type="email" />}</FormField>
              <FormField label="Phone">{(p) => <Input {...p} name="phone" />}</FormField>
            </div>
            {advancedCrm ? (
              <FormField label="Label colour">
                {(p) => <input {...p} name="labelColor" type="color" defaultValue="#7450A6" className="h-10 w-16 rounded-md border border-line-soft" />}
              </FormField>
            ) : null}
            {state && !state.ok ? <p className="text-sm text-state-danger">{state.error}</p> : null}
            {state?.ok ? <p className="text-sm text-state-success">{state.message}</p> : null}
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add student"}
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
  disabled,
}: {
  id: string;
  status: "ACTIVE" | "INACTIVE" | "FORMER";
  disabled?: boolean;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button
        disabled={pending || disabled}
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await setStudentStatusAction(id, status);
            if (!r.ok) setErr(r.error);
          })
        }
        className="rounded-pill border border-line-soft px-2.5 py-1 text-xs disabled:opacity-40"
      >
        {pending ? "…" : `Set ${status.toLowerCase()}`}
      </button>
      {err ? <span className="w-full text-xs text-state-danger">{err}</span> : null}
    </>
  );
}

function NotesBlock({
  studentId,
  notes,
}: {
  studentId: string;
  notes: { id: string; body: string; createdAt: string }[];
}) {
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
        <Textarea name="body" placeholder="Private note…" className="min-h-[2.5rem] flex-1 text-xs" />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          Add
        </Button>
      </form>
      {state && !state.ok ? <p className="mt-1 text-xs text-state-danger">{state.error}</p> : null}
    </div>
  );
}
