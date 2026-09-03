import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AnimatedSearchField } from "@/components/brand/AnimatedSearchField";
import { Reveal } from "@/components/brand/Reveal";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { featuredProviders, listCategories } from "@/lib/data/discovery";
import { COMMISSION_RATE, PREMIUM_PRICE, PREMIUM_TRIAL_DAYS } from "@/lib/config/commerce";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const CATEGORY_FALLBACK = [
  { slug: "academic", icon: "📘" },
  { slug: "languages", icon: "🗣️" },
  { slug: "sports", icon: "🎾" },
  { slug: "music", icon: "🎵" },
  { slug: "art-design", icon: "🎨" },
  { slug: "exam-prep", icon: "🎯" },
];

export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("categoriesPage.names");
  const common = await getTranslations("common");
  const [providers, categories] = await Promise.all([featuredProviders(6), listCategories()]);
  const cats = (categories.length ? categories : CATEGORY_FALLBACK).map((c) => ({
    slug: c.slug,
    name: tc.has(c.slug) ? tc(c.slug) : ("name" in c ? c.name : c.slug),
    icon: ("icon" in c && c.icon) || "✦",
  }));

  const how = [
    { step: "1", title: t("how1Title"), body: t("how1Body") },
    { step: "2", title: t("how2Title"), body: t("how2Body") },
    { step: "3", title: t("how3Title"), body: t("how3Body") },
  ];
  const why = [
    { glyph: "🔒", title: t("why1Title"), body: t("why1Body") },
    { glyph: "🗓️", title: t("why2Title"), body: t("why2Body") },
    { glyph: "↩️", title: t("why3Title"), body: t("why3Body") },
    { glyph: "🌱", title: t("why4Title"), body: t("why4Body") },
  ];

  return (
    <div className="space-y-24">
      <section className="relative pt-6">
        <Reveal>
          <p className="text-sm font-medium uppercase tracking-wider text-brand-purple-600">
            {t("kicker")}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-[1.08] sm:text-5xl md:text-6xl">
            {t("titleLine1")}
            <br />
            <span className="text-brand-purple-700">{t("titleLine2")}</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-ink-secondary">{t("subtitle")}</p>
        </Reveal>
        <Reveal delay={120} className="mt-8">
          <AnimatedSearchField className="max-w-3xl" />
        </Reveal>
        <Reveal delay={200} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-tertiary">
          <span>✓ {t("trust1")}</span>
          <span>✓ {t("trust2")}</span>
          <span>✓ {t("trust3")}</span>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">{t("popularCategories")}</h2>
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

      <section>
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl sm:text-3xl">{t("featuredTeachers")}</h2>
            <Link href="/search" className="text-sm font-medium text-brand-purple-700 hover:underline">
              {t("browseAll")} →
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
            title={t("emptyTitle")}
            description={t("emptyBody")}
            action={{ label: t("emptyCta"), href: "/signup?role=provider" }}
          />
        )}
      </section>

      <section>
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">{t("howTitle")}</h2>
        </Reveal>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {how.map((s, i) => (
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

      <section className="rounded-2xl bg-brand-lavender-100/60 p-8">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">{t("whyTitle")}</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-secondary">{t("whyBody")}</p>
        </Reveal>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {why.map((w, i) => (
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

      <section className="grid items-center gap-8 md:grid-cols-2">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl">{t("teacherTitle")}</h2>
          <p className="mt-3 text-ink-secondary">{t("teacherBody")}</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
            <li>• {t("teacherFree", { free: Math.round(COMMISSION_RATE.FREE * 100) })}</li>
            <li>• {t("teacherPremium", { premium: Math.round(COMMISSION_RATE.PREMIUM * 100) })}</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <Button href="/signup?role=provider">{t("startTeaching")}</Button>
            <Button href="/for-teachers" variant="secondary">
              {t("learnMore")}
            </Button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Card className="bg-gradient-to-br from-brand-yellow-100 to-brand-lavender-100">
            <p className="font-serif text-lg">Premium</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatMoney(PREMIUM_PRICE.MONTH)}
              <span className="text-base font-normal text-ink-secondary"> {common("perMonth")}</span>
            </p>
            <p className="text-sm text-ink-secondary">
              {t("premiumTrialLine", {
                yearly: formatMoney(PREMIUM_PRICE.YEAR),
                days: PREMIUM_TRIAL_DAYS,
              })}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>✓ {t("premiumBul1")}</li>
              <li>✓ {t("premiumBul2")}</li>
              <li>✓ {t("premiumBul3")}</li>
              <li>✓ {t("premiumBul4")}</li>
            </ul>
            <Button href="/premium" className="mt-5 w-full">
              {t("seePremium")}
            </Button>
          </Card>
        </Reveal>
      </section>

      <section className="rounded-2xl border border-line-lavender bg-surface-base p-8 text-center">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-purple-600">
            {t("workspaceKicker")}
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl">{t("workspaceTitle")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-secondary">{t("workspaceBody")}</p>
        </Reveal>
      </section>
    </div>
  );
}
