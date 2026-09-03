import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireProvider } from "@/lib/authz";
import { providerCalendar, providerStudents } from "@/lib/data/provider";
import { CalendarBoard } from "@/components/provider/CalendarBoard";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar");
  return { title: t("metaTitle") };
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function ProviderCalendarPage() {
  const t = await getTranslations("calendar");
  const { provider, plan, entitlements } = await requireProvider();
  const [{ slots, lessons }, students] = await Promise.all([
    providerCalendar(provider.id),
    providerStudents(provider.id),
  ]);

  const days: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) days.push(dayKey(new Date(base.getTime() + i * 86_400_000)));

  const slotsByDay: Record<string, typeof slots> = {};
  for (const s of slots) (slotsByDay[dayKey(s.startsAt)] ??= []).push(s);
  const lessonsByDay: Record<string, typeof lessons> = {};
  for (const l of lessons) (lessonsByDay[dayKey(l.startsAt)] ??= []).push(l);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">
          {plan === "FREE" ? t("subtitleFree") : t("subtitlePremium")}
        </p>
      </div>
      <CalendarBoard
        days={days}
        slotsByDay={Object.fromEntries(
          Object.entries(slotsByDay).map(([k, v]) => [
            k,
            v.map((s) => ({
              id: s.id,
              startsAt: s.startsAt.toISOString(),
              endsAt: s.endsAt.toISOString(),
              isBooked: s.isBooked,
            })),
          ]),
        )}
        lessonsByDay={Object.fromEntries(
          Object.entries(lessonsByDay).map(([k, v]) => [
            k,
            v.map((l) => ({
              id: l.id,
              startsAt: l.startsAt.toISOString(),
              endsAt: l.endsAt.toISOString(),
              status: l.status,
              studentName: l.student?.fullName,
              labelColor: l.student?.labelColor,
            })),
          ]),
        )}
        advancedCalendar={entitlements.advancedCalendar}
        students={students.map((s) => ({ id: s.id, name: s.fullName }))}
      />
    </div>
  );
}
