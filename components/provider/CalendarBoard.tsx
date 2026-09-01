"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addAvailabilityAction,
  deleteAvailabilityAction,
  createRecurringLessonAction,
  type ActionResult,
} from "@/lib/actions/provider";
import { Button } from "@/components/ui/Button";
import { Input, Select, FormField } from "@/components/ui/Field";
import { Disclosure } from "@/components/ui/Disclosure";
import { Badge } from "@/components/ui/Badge";

interface Slot {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}
interface Lesson {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  studentName?: string;
  labelColor?: string | null;
}
interface StudentOpt {
  id: string;
  name: string;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CalendarBoard({
  days,
  slotsByDay,
  lessonsByDay,
  advancedCalendar,
  students,
}: {
  days: string[];
  slotsByDay: Record<string, Slot[]>;
  lessonsByDay: Record<string, Lesson[]>;
  advancedCalendar: boolean;
  students: StudentOpt[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const d = new Date(day);
          const slots = slotsByDay[day] ?? [];
          const lessons = lessonsByDay[day] ?? [];
          return (
            <div key={day} className="rounded-lg border border-line-soft bg-surface-base p-3 shadow-soft">
              <p className="text-sm font-semibold">
                {new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" }).format(d)}
              </p>
              <div className="mt-2 space-y-1.5">
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-1.5 rounded-md bg-brand-purple-100 px-2 py-1 text-xs"
                    style={l.labelColor ? { borderLeft: `3px solid ${l.labelColor}` } : undefined}
                  >
                    <span className="font-medium">
                      {new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(l.startsAt))}
                    </span>
                    <span className="truncate">{l.studentName ?? "Lesson"}</span>
                    {l.status !== "SCHEDULED" ? <Badge tone="neutral">{l.status.toLowerCase()}</Badge> : null}
                  </div>
                ))}
                {slots.map((s) => (
                  <SlotChip key={s.id} slot={s} />
                ))}
                {!lessons.length && !slots.length ? (
                  <p className="text-xs text-ink-tertiary">No availability</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Disclosure label="+ Add availability">
        <AvailabilityForm />
      </Disclosure>

      <Disclosure label={advancedCalendar ? "+ Create a recurring lesson" : "Recurring lessons (Premium)"}>
        {advancedCalendar ? (
          <RecurringForm students={students} />
        ) : (
          <p className="text-sm text-ink-secondary">
            Recurring lessons — “every Saturday at 14:00 for 8 weeks”, created once — are a
            Premium feature.{" "}
            <a href="/premium" className="text-brand-purple-700 underline">
              See Premium
            </a>
            .
          </p>
        )}
      </Disclosure>
    </div>
  );
}

function SlotChip({ slot }: { slot: Slot }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-md bg-brand-lavender-100 px-2 py-1 text-xs">
      <span>
        {new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(slot.startsAt))}
        {" – "}
        {new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(slot.endsAt))}
      </span>
      {slot.isBooked ? (
        <Badge tone="success">booked</Badge>
      ) : (
        <button
          disabled={pending}
          onClick={() => start(() => deleteAvailabilityAction(slot.id).then(() => undefined))}
          className="text-ink-tertiary hover:text-state-danger"
          aria-label="Remove slot"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AvailabilityForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addAvailabilityAction,
    null,
  );
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <FormField label="Start">
        {(p) => <Input {...p} name="startsAt" type="datetime-local" required />}
      </FormField>
      <FormField label="End">
        {(p) => <Input {...p} name="endsAt" type="datetime-local" required />}
      </FormField>
      <div className="sm:col-span-2">
        {state && !state.ok ? <p className="mb-2 text-sm text-state-danger">{state.error}</p> : null}
        {state?.ok ? <p className="mb-2 text-sm text-state-success">{state.message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add slot"}
        </Button>
      </div>
    </form>
  );
}

function RecurringForm({ students }: { students: StudentOpt[] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createRecurringLessonAction,
    null,
  );
  const [preview, setPreview] = useState<{ weekday: number; occurrences: number } | null>(null);

  return (
    <form action={action} className="space-y-3">
      <FormField label="Student" required>
        {(p) => (
          <Select {...p} name="studentId" required defaultValue="">
            <option value="" disabled>
              Choose a student
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}
      </FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Weekday" required>
          {(p) => (
            <Select
              {...p}
              name="weekday"
              defaultValue="5"
              onChange={(e) => setPreview((v) => ({ weekday: Number(e.target.value), occurrences: v?.occurrences ?? 8 }))}
            >
              {WEEKDAYS.map((w, i) => (
                <option key={w} value={i}>
                  {w}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label="Start time" required>
          {(p) => <Input {...p} name="startTime" type="time" defaultValue="14:00" required />}
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label="Duration (min)" required>
          {(p) => <Input {...p} name="durationMin" type="number" min={15} max={480} defaultValue={60} required />}
        </FormField>
        <FormField label="First date" required>
          {(p) => <Input {...p} name="startDate" type="date" required />}
        </FormField>
        <FormField label="Weeks" required>
          {(p) => (
            <Input
              {...p}
              name="occurrences"
              type="number"
              min={1}
              max={52}
              defaultValue={8}
              onChange={(e) =>
                setPreview((v) => ({ weekday: v?.weekday ?? 5, occurrences: Number(e.target.value) }))
              }
              required
            />
          )}
        </FormField>
      </div>
      {preview ? (
        <p className="text-xs text-ink-tertiary">
          Creates {preview.occurrences} lessons every {WEEKDAYS[preview.weekday]}. Conflicting
          slots are skipped automatically.
        </p>
      ) : null}
      {state && !state.ok ? <p className="text-sm text-state-danger">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-state-success">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating…" : "Create recurring lesson"}
      </Button>
    </form>
  );
}
