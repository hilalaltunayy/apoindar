import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { studentDashboard } from "@/lib/data/student";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/brand/Reveal";
import { packageProgress, remainingCredits } from "@/lib/domain/package-credit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your learning" };

export default async function StudentDashboard() {
  const user = await requireUser();
  if (user.role === "PROVIDER") redirect("/provider");
  if (user.role === "ADMIN") redirect("/admin");

  const { upcoming, packages, recentProviders } = await studentDashboard(user.id);
  const nextLesson = upcoming[0];
  const activePackage = packages.find((p) => remainingCredits(p) > 0);

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="text-2xl">
          {greeting()}, {user.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="text-sm text-ink-secondary">Here’s where your learning stands.</p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Next lesson"
          tone="yellow"
          value={
            nextLesson?.scheduledAt
              ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(nextLesson.scheduledAt)
              : "—"
          }
          hint={nextLesson ? `with ${nextLesson.provider.displayName}` : "No upcoming lessons"}
        />
        <StatCard
          label="Active package"
          tone="lavender"
          value={activePackage ? `${remainingCredits(activePackage)} left` : "—"}
          hint={
            activePackage
              ? `${activePackage.booking.listing.title} · ${Math.round(packageProgress(activePackage) * 100)}% done`
              : "No active package"
          }
        />
        <StatCard
          label="Upcoming bookings"
          value={upcoming.length}
          hint={upcoming.length ? "confirmed & paid" : "Book your next lesson"}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl">Upcoming bookings</h2>
          <Link href="/bookings" className="text-sm text-brand-purple-700 hover:underline">
            All bookings →
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
                      ? ` · ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                      : " · time to be arranged"}
                  </p>
                </div>
                <Link
                  href={`/bookings`}
                  className="rounded-pill bg-brand-lavender-100 px-3 py-1 text-xs font-medium text-brand-purple-700"
                >
                  Details
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            glyph="🗓️"
            title="No upcoming lessons"
            description="Find a teacher and book your first lesson — it takes a couple of minutes."
            action={{ label: "Find a teacher", href: "/search" }}
          />
        )}
      </section>

      {recentProviders.length ? (
        <section>
          <h2 className="mb-3 text-xl">Continue with</h2>
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
                  <p className="text-xs text-ink-tertiary">{b.provider.headline ?? "Teacher"}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
