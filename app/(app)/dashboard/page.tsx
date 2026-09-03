import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import { studentDashboard } from "@/lib/data/student";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/brand/Reveal";
import { packageProgress, remainingCredits } from "@/lib/domain/package-credit";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("studentDash");
  return { title: t("metaTitle") };
}

export default async function StudentDashboard() {
  const user = await requireUser();
  if (user.role === "PROVIDER") redirect("/provider");
  if (user.role === "ADMIN") redirect("/admin");

  const t = await getTranslations("studentDash");
  const common = await getTranslations("common");
  const locale = await getLocale();
  const loc = locale === "tr" ? "tr-TR" : "en-GB";
  const { upcoming, packages, recentProviders } = await studentDashboard(user.id);
  const nextLesson = upcoming[0];
  const activePackage = packages.find((p) => remainingCredits(p) > 0);

  const h = new Date().getHours();
  const greeting = h < 12 ? t("greetingMorning") : h < 18 ? t("greetingAfternoon") : t("greetingEvening");

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="text-2xl">
          {t("greeting", { greeting, name: user.name?.split(" ")[0] ?? "" })}
        </h1>
        <p className="text-sm text-ink-secondary">{t("subtitle")}</p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("nextLesson")}
          tone="yellow"
          value={
            nextLesson?.scheduledAt
              ? new Intl.DateTimeFormat(loc, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(nextLesson.scheduledAt)
              : "—"
          }
          hint={nextLesson ? t("with", { name: nextLesson.provider.displayName }) : t("noUpcoming")}
        />
        <StatCard
          label={t("activePackage")}
          tone="lavender"
          value={activePackage ? t("remaining", { count: remainingCredits(activePackage) }) : "—"}
          hint={
            activePackage
              ? t("packageProgress", {
                  title: activePackage.booking.listing.title,
                  percent: Math.round(packageProgress(activePackage) * 100),
                })
              : t("noActivePackage")
          }
        />
        <StatCard
          label={t("upcomingBookings")}
          value={upcoming.length}
          hint={upcoming.length ? t("confirmedPaid") : t("bookNext")}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">{t("upcomingBookings")}</h2>
          <Link href="/bookings" className="text-sm text-brand-purple-700 hover:underline">
            {t("allBookings")} →
          </Link>
        </div>
        {upcoming.length ? (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <Card key={b.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.listing.title}</p>
                  <p className="text-sm text-ink-secondary">
                    {b.provider.displayName}
                    {b.scheduledAt
                      ? ` · ${new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                      : ` · ${t("timeToArrange")}`}
                  </p>
                </div>
                <Link
                  href="/bookings"
                  className="rounded-pill bg-brand-lavender-100 px-3 py-1 text-xs font-medium text-brand-purple-700"
                >
                  {common("details")}
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            glyph="🗓️"
            title={t("noUpcomingTitle")}
            description={t("noUpcomingBody")}
            action={{ label: t("findTeacher"), href: "/search" }}
          />
        )}
      </section>

      {recentProviders.length ? (
        <section>
          <h2 className="mb-3 text-xl">{t("continueWith")}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {recentProviders.map((b) => (
              <Link
                key={b.id}
                href={`/providers/${b.provider.id}`}
                className="flex items-center gap-3 rounded-lg border border-line-soft bg-surface-base p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-raised"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-lavender-200 text-lg">
                  🎓
                </span>
                <div>
                  <p className="text-sm font-medium">{b.provider.displayName}</p>
                  <p className="text-xs text-ink-tertiary">{b.provider.headline ?? ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
