import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { searchProviders } from "@/lib/data/discovery";
import { ProviderCard } from "@/components/marketplace/ProviderCard";
import { SearchFilters } from "@/components/marketplace/SearchFilters";
import { ProviderCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/brand/Reveal";
import { AnimatedSearchField } from "@/components/brand/AnimatedSearchField";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("search");
  return { title: t("title") };
}

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

async function Results({ sp }: { sp: SP }) {
  const t = await getTranslations("search");
  const page = Number(one(sp.page) ?? "1") || 1;
  const { results, total, pageSize } = await searchProviders({
    q: one(sp.q),
    city: one(sp.city),
    categorySlug: one(sp.category),
    mode:
      one(sp.mode) === "ONLINE" ? "ONLINE" : one(sp.mode) === "IN_PERSON" ? "IN_PERSON" : undefined,
    maxPrice: one(sp.max) ? Number(one(sp.max)) : undefined,
    sort:
      one(sp.sort) === "price_asc"
        ? "price_asc"
        : one(sp.sort) === "price_desc"
          ? "price_desc"
          : "relevance",
    page,
  });

  if (!results.length) {
    return (
      <EmptyState
        glyph="🔎"
        title={t("noResultsTitle")}
        description={t("noResultsBody")}
        action={{ label: t("clearFilters"), href: "/search" }}
      />
    );
  }

  const pages = Math.ceil(total / pageSize);
  const qs = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") next.set(k, one(v)!);
    next.set("page", String(p));
    return `/search?${next.toString()}`;
  };

  return (
    <div>
      <p className="mb-4 text-sm text-ink-secondary">{t("resultsCount", { count: total })}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {results.map((p, i) => (
          <Reveal key={p.id} delay={i * 50}>
            <ProviderCard provider={p} priority={i < 4} />
          </Reveal>
        ))}
      </div>
      {pages > 1 ? (
        <nav className="mt-8 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: pages }).map((_, i) => (
            <Link
              key={i}
              href={qs(i + 1)}
              className={`rounded-md px-3 py-1.5 ${
                i + 1 === page
                  ? "bg-brand-purple-600 text-white"
                  : "border border-line-soft hover:bg-brand-lavender-100"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SP> }) {
  const t = await getTranslations("search");
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">{t("title")}</h1>
        <div className="mt-4">
          <AnimatedSearchField className="max-w-3xl" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <SearchFilters
          facets={{
            categorySlug: one(sp.category),
            city: one(sp.city),
            mode: one(sp.mode),
            sort: one(sp.sort),
            max: one(sp.max),
          }}
        />
        <Suspense
          key={JSON.stringify(sp)}
          fallback={
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <Results sp={sp} />
        </Suspense>
      </div>
    </div>
  );
}
