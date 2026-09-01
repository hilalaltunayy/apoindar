import Link from "next/link";
import { AnimatedSearchField } from "@/components/brand/AnimatedSearchField";
import { Reveal } from "@/components/brand/Reveal";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { featuredProviders, listCategories } from "@/lib/data/discovery";
import {
  COMMISSION_RATE,
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
} from "@/lib/config/commerce";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const CATEGORY_FALLBACK = [
  { slug: "academic", name: "Academic", icon: "📘" },
  { slug: "languages", name: "Languages", icon: "🗣️" },
  { slug: "sports", name: "Sports", icon: "🎾" },
  { slug: "music", name: "Music", icon: "🎵" },
  { slug: "art-design", name: "Art & Design", icon: "🎨" },
  { slug: "exam-prep", name: "Exam Preparation", icon: "🎯" },
];

const HOW_IT_WORKS = [
  { step: "1", title: "Search", body: "Tell us what you want to learn and where. Browse real teacher profiles." },
  { step: "2", title: "Book a lesson", body: "Pick a lesson or package and a time that works. Pay securely in Apoindar." },
  { step: "3", title: "Keep learning", body: "Track your package, reschedule when life happens, and continue with your teacher." },
];

const WHY_BOOK = [
  { glyph: "🔒", title: "Secure payment", body: "Every lesson has a payment record and booking confirmation." },
  { glyph: "🗓️", title: "Package tracking", body: "See exactly how many lessons you have left." },
  { glyph: "↩️", title: "Cancellation & refunds", body: "Clear policies and a real refund process — not a DM you can't prove." },
  { glyph: "🌱", title: "Continuity", body: "Your history, providers and progress stay in one place." },
];

export default async function HomePage() {
  const [providers, categories] = await Promise.all([featuredProviders(6), listCategories()]);
  const cats = categories.length
    ? categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon ?? "✦" }))
    : CATEGORY_FALLBACK;

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="relative pt-6">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-purple-600">
            Education marketplace
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
            Find the right teacher.
            <br />
            <span className="text-brand-purple-700">Achieve your goals.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-secondary">
            Discover tutors and coaches for academics, languages, sports, music and more.
            Book securely and keep the learning relationship in one place.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8">
          <AnimatedSearchField className="max-w-3xl" />
        </Reveal>
        <Reveal delay={200} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-tertiary">
          <span>✓ Students pay no platform fee</span>
          <span>✓ Verified booking & payment records</span>
          <span>✓ Free & Premium teachers, all discoverable</span>
        </Reveal>
      </section>

      {/* Popular categories */}
      <section>
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">Popular categories</h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c, i) => (
            <Reveal key={c.slug} delay={i * 40}>
              <Link
                href={`/search?category=${c.slug}`}
                className="flex h-full flex-col items-start gap-2 rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft transition-[transform,box-shadow] duration-250 ease-butter hover:-translate-y-0.5 hover:shadow-raised"
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="text-sm font-semibold">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Featured providers */}
      <section>
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl">Featured teachers</h2>
            <Link href="/search" className="text-sm font-medium text-brand-purple-700 hover:underline">
              Browse all →
            </Link>
          </div>
        </Reveal>
        {providers.length ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <ProviderCard provider={p} priority={i < 3} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-6"
            glyph="🌤️"
            title="Teachers are on their way"
            description="The marketplace is warming up. Be one of the first to join as a teacher."
            action={{ label: "Become a teacher", href: "/signup?role=provider" }}
          />
        )}
      </section>

      {/* How it works */}
      <section>
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">How Apoindar works</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((s, i) => (
            <Reveal key={s.step} delay={i * 60}>
              <Card className="h-full">
                <span className="flex h-9 w-9 items-center justify-center rounded-pill bg-brand-purple-600 font-serif text-white">
                  {s.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{s.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why book through Apoindar */}
      <section className="rounded-2xl bg-brand-lavender-100/60 p-8">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">Why book through Apoindar</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-secondary">
            You could message a teacher on WhatsApp. But then you lose the record, the
            refund process, and your package history. Apoindar keeps all of it.
          </p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_BOOK.map((w, i) => (
            <Reveal key={w.title} delay={i * 50}>
              <div className="rounded-lg bg-surface-base p-4 shadow-soft">
                <span className="text-xl">{w.glyph}</span>
                <h3 className="mt-2 text-sm font-semibold">{w.title}</h3>
                <p className="mt-1 text-xs text-ink-secondary">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* For teachers */}
      <section className="grid items-center gap-8 md:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">Turn your empty hours into income</h2>
          <p className="mt-3 text-ink-secondary">
            Get discovered by real students, sell single lessons and packages, manage
            your schedule and students, and keep more of what you earn.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
            <li>• Free plan: {Math.round(COMMISSION_RATE.FREE * 100)}% commission, 1 active listing, 3 active students</li>
            <li>• Premium: {Math.round(COMMISSION_RATE.PREMIUM * 100)}% commission, unlimited listings & students</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Button href="/signup?role=provider">Start teaching</Button>
            <Button href="/for-teachers" variant="secondary">
              Learn more
            </Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Card className="bg-gradient-to-br from-brand-yellow-100 to-brand-lavender-100">
            <p className="font-serif text-lg">Premium</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatMoney(PREMIUM_PRICE.MONTH)}
              <span className="text-base font-normal text-ink-secondary"> / month</span>
            </p>
            <p className="text-sm text-ink-secondary">
              or {formatMoney(PREMIUM_PRICE.YEAR)} / year · {PREMIUM_TRIAL_DAYS}-day free trial, no card
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>✓ 7% commission instead of 12%</li>
              <li>✓ Unlimited lessons, packages & students</li>
              <li>✓ Recurring lessons & advanced calendar</li>
              <li>✓ Growth Dashboard & analytics</li>
            </ul>
            <Button href="/premium" className="mt-5 w-full">
              See Premium
            </Button>
          </Card>
        </Reveal>
      </section>

      {/* Workspace teaser */}
      <section className="rounded-2xl border border-line-lavender bg-surface-base p-8 text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-purple-600">
            Coming later
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl">A shared space after your first paid lesson</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-secondary">
            Once you complete a paid lesson or package, a private student–teacher
            workspace opens up: assignments, progress and mentorship between lessons.
          </p>
        </Reveal>
      </section>
    </div>
  );
}
