"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { statusLabel } from "@/lib/i18n/labels";
import { useActionError } from "@/lib/i18n/action-error";

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
  const t = useTranslations("calendar");
  const tHome = useTranslations("home");
  const st = useTranslations("statusLabels");
  const locale = useLocale();
  const loc = locale === "tr" ? "tr-TR" : "en-GB";
  const dayFmt = new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short" });
  const timeFmt = new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {days.map((day) => {
          const d = new Date(day);
          const slots = slotsByDay[day] ?? [];
          const lessons = lessonsByDay[day] ?? [];
          return (
            <div
              key={day}
              className="rounded-lg border border-line-soft bg-surface-base p-3 shadow-soft"
            >
              <p className="text-sm font-semibold">{dayFmt.format(d)}</p>
              <div className="mt-2 space-y-1.5">
                {lessons.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-1.5 rounded-md bg-brand-purple-100 px-2 py-1 text-xs"
                    style={l.labelColor ? { borderLeft: `3px solid ${l.labelColor}` } : undefined}
                  >
                    <span className="font-medium">{timeFmt.format(new Date(l.startsAt))}</span>
                    <span className="truncate">{l.studentName ?? "—"}</span>
                    {l.status !== "SCHEDULED" ? (
                      <Badge tone="neutral">{statusLabel(l.status, st)}</Badge>
                    ) : null}
                  </div>
                ))}
                {slots.map((s) => (
                  <SlotChip key={s.id} slot={s} timeFmt={timeFmt} bookedLabel={t("booked")} />
                ))}
                {!lessons.length && !slots.length ? (
                  <p className="text-xs text-ink-tertiary">{t("noAvailability")}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Disclosure label={t("addAvailability")}>
        <AvailabilityForm />
      </Disclosure>

      <Disclosure label={advancedCalendar ? t("recurringCta") : t("recurringPremiumCta")}>
        {advancedCalendar ? (
          <RecurringForm students={students} />
        ) : (
          <p className="text-sm text-ink-secondary">
            {t("recurringPremiumBody")}{" "}
            <a href="/premium" className="text-brand-purple-700 underline">
              {tHome("seePremium")}
            </a>
          </p>
        )}
      </Disclosure>
    </div>
  );
}

function SlotChip({
  slot,
  timeFmt,
  bookedLabel,
}: {
  slot: Slot;
  timeFmt: Intl.DateTimeFormat;
  bookedLabel: string;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-between rounded-md bg-brand-lavender-100 px-2 py-1 text-xs">
      <span>
        {timeFmt.format(new Date(slot.startsAt))} – {timeFmt.format(new Date(slot.endsAt))}
      </span>
      {slot.isBooked ? (
        <Badge tone="success">{bookedLabel}</Badge>
      ) : (
        <button
          disabled={pending}
          onClick={() => start(() => deleteAvailabilityAction(slot.id).then(() => undefined))}
          className="text-ink-tertiary hover:text-state-danger"
          aria-label="✕"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AvailabilityForm() {
  const t = useTranslations("calendar");
  const common = useTranslations("common");
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    addAvailabilityAction,
    null,
  );
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <FormField label={t("start")}>
        {(p) => <Input {...p} name="startsAt" type="datetime-local" required />}
      </FormField>
      <FormField label={t("end")}>
        {(p) => <Input {...p} name="endsAt" type="datetime-local" required />}
      </FormField>
      <div className="sm:col-span-2">
        {state && !state.ok ? (
          <p className="mb-2 text-sm text-state-danger">{errText(state)}</p>
        ) : null}
        {state?.ok ? <p className="mb-2 text-sm text-state-success">{t("availabilityAdded")}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? common("saving") : t("addSlot")}
        </Button>
      </div>
    </form>
  );
}

function RecurringForm({ students }: { students: StudentOpt[] }) {
  const t = useTranslations("calendar");
  const wd = useTranslations("calendar.weekdays");
  const errText = useActionError();
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    createRecurringLessonAction,
    null,
  );
  const [preview, setPreview] = useState<{ weekday: number; occurrences: number }>({
    weekday: 5,
    occurrences: 8,
  });

  return (
    <form action={action} className="space-y-3">
      <FormField label={t("recurringStudent")} required>
        {(p) => (
          <Select {...p} name="studentId" required defaultValue="">
            <option value="" disabled>
              {t("chooseStudent")}
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
        <FormField label={t("weekday")} required>
          {(p) => (
            <Select
              {...p}
              name="weekday"
              defaultValue="5"
              onChange={(e) => setPreview((v) => ({ ...v, weekday: Number(e.target.value) }))}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <option key={i} value={i}>
                  {wd(String(i))}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("startTime")} required>
          {(p) => <Input {...p} name="startTime" type="time" defaultValue="14:00" required />}
        </FormField>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormField label={t("durationMin")} required>
          {(p) => (
            <Input {...p} name="durationMin" type="number" min={15} max={480} defaultValue={60} required />
          )}
        </FormField>
        <FormField label={t("firstDate")} required>
          {(p) => <Input {...p} name="startDate" type="date" required />}
        </FormField>
        <FormField label={t("weeks")} required>
          {(p) => (
            <Input
              {...p}
              name="occurrences"
              type="number"
              min={1}
              max={52}
              defaultValue={8}
              onChange={(e) => setPreview((v) => ({ ...v, occurrences: Number(e.target.value) }))}
              required
            />
          )}
        </FormField>
      </div>
      <p className="text-xs text-ink-tertiary">
        {t("recurringPreview", {
          count: preview.occurrences,
          weekday: wd(String(preview.weekday)),
        })}
      </p>
      {state && !state.ok ? <p className="text-sm text-state-danger">{errText(state)}</p> : null}
      {state?.ok ? (
        <p className="text-sm text-state-success">
          {t("recurringCreated", {
            count: Number(state.data?.generated ?? 0),
            skipped: Number(state.data?.skipped ?? 0),
          })}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? t("creating") : t("createRecurring")}
      </Button>
    </form>
  );
}
