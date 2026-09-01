import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/authz";
import { providerHome, providerDashboardData } from "@/lib/data/provider";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/brand/Reveal";
import { formatMoney } from "@/lib/money";
import { COMMISSION_RATE, PLAN_LIMITS } from "@/lib/config/commerce";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Teacher dashboard" };

export default async function ProviderDashboard() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/provider");
  if (user.role !== "PROVIDER") redirect("/dashboard");

  const { provider, plan, entitlements } = await providerHome();
  const d = await providerDashboardData(provider.id);
  const isPremium = plan === "PREMIUM";
  const rate = COMMISSION_RATE[plan];
  const next = d.upcoming[0];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl">Today, {provider.displayName.split(" ")[0]}</h1>
            <p className="text-sm text-ink-secondary">
              {new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
            </p>
          </div>
          <Badge tone={isPremium ? "purple" : "neutral"}>
            {isPremium ? "Premium" : "Free"} · {Math.round(rate * 100)}% commission
          </Badge>
        </div>
      </Reveal>

      {/* Dominant "today" module */}
      <Reveal>
        <Card className="bg-gradient-to-br from-brand-yellow-100/80 to-brand-lavender-100/70">
          <h2 className="font-serif text-lg">Your next lesson</h2>
          {next ? (
            <div className="mt-2">
              <p className="text-2xl font-semibold">
                {next.scheduledAt
                  ? new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" }).format(next.scheduledAt)
                  : "Time to arrange"}
              </p>
              <p className="text-sm text-ink-secondary">
                {next.listing.title} · {next.studentUser?.name ?? "Student"}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-ink-secondary">
              No upcoming lessons. Add availability so students can book you.
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Link href="/provider/calendar" className="rounded-pill bg-brand-purple-600 px-4 py-2 text-sm font-semibold text-white">
              Open calendar
            </Link>
            <Link href="/provider/listings" className="rounded-pill border border-brand-purple-300 px-4 py-2 text-sm font-semibold text-brand-purple-700">
              Lessons &amp; packages
            </Link>
          </div>
        </Card>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today’s lessons" value={d.todayLessons.length} tone="yellow" />
        <StatCard
          label="Active students"
          value={
            Number.isFinite(entitlements.studentsMaxActive)
              ? `${d.activeStudents} / ${entitlements.studentsMaxActive}`
              : d.activeStudents
          }
          hint={!isPremium && d.activeStudents >= PLAN_LIMITS.FREE.activeStudents ? "Limit reached" : undefined}
        />
        <StatCard
          label="Active listings"
          value={
            Number.isFinite(entitlements.listingsMaxActive)
              ? `${d.activeListings} / ${entitlements.listingsMaxActive}`
              : d.activeListings
          }
        />
        <StatCard
          label="Net revenue (30d)"
          tone="lavender"
          value={formatMoney(d.revenue30dNet, provider.currency)}
          hint={`from ${formatMoney(d.revenue30dGross, provider.currency)} gross`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg">Upcoming bookings</h2>
          {d.upcoming.length ? (
            <div className="space-y-2">
              {d.upcoming.map((b) => (
                <Card key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{b.listing.title}</p>
                    <p className="text-xs text-ink-tertiary">
                      {b.studentUser?.name ?? "Student"}
                      {b.scheduledAt
                        ? ` · ${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(b.scheduledAt)}`
                        : ""}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState glyph="📆" title="No upcoming bookings" description="Bookings from students appear here." />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg">Recent payments</h2>
          {d.recentPayments.length ? (
            <div className="space-y-2">
              {d.recentPayments.map((p) => (
                <Card key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{p.booking.listing.title}</p>
                    <p className="text-xs text-ink-tertiary">
                      {p.succeededAt
                        ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(p.succeededAt)
                        : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatMoney(p.providerNet, p.currency)}</p>
                    <p className="text-xs text-ink-tertiary">
                      net of {formatMoney(p.platformCommission, p.currency)} fee
                    </p>
                  </div>
                </Card>
              ))}
              <Link href="/provider/earnings" className="text-sm text-brand-purple-700 hover:underline">
                Full earnings →
              </Link>
            </div>
          ) : (
            <EmptyState glyph="💸" title="No payments yet" description="Paid bookings show up here." />
          )}
        </section>
      </div>

      {!isPremium ? (
        <Reveal>
          <Card className="border-brand-purple-200 bg-brand-lavender-100/50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg">Keep more of what you earn</h3>
                <p className="text-sm text-ink-secondary">
                  Premium drops your commission from 12% to 7% and unlocks recurring lessons,
                  unlimited students and the Growth Dashboard.
                </p>
              </div>
              <Link href="/premium" className="rounded-pill bg-brand-yellow-500 px-5 py-2.5 text-sm font-semibold">
                See Premium
              </Link>
            </div>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}
