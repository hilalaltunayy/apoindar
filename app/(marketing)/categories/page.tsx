import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listCategories } from "@/lib/data/discovery";
import { Reveal } from "@/components/brand/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("categoriesPage");
  return { title: t("metaTitle") };
}

const FALLBACK = [
  { slug: "academic", icon: "📘" },
  { slug: "languages", icon: "🗣️" },
  { slug: "sports", icon: "🎾" },
  { slug: "music", icon: "🎵" },
  { slug: "art-design", icon: "🎨" },
  { slug: "exam-prep", icon: "🎯" },
];

export default async function CategoriesPage() {
  const t = await getTranslations("categoriesPage");
  const tn = await getTranslations("categoriesPage.names");
  const db = await listCategories();
  const cats = (db.length ? db : FALLBACK).map((c) => ({
    slug: c.slug,
    icon: ("icon" in c && c.icon) || "✦",
    name: tn.has(c.slug) ? tn(c.slug) : c.slug,
  }));

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="text-3xl">{t("title")}</h1>
        <p className="mt-2 text-ink-secondary">{t("subtitle")}</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <Reveal key={c.slug} delay={i * 40}>
            <Link
              href={`/search?category=${c.slug}`}
              className="flex h-full flex-col gap-2 rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-raised"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="font-serif text-lg">{c.name}</span>
              <span className="text-sm text-brand-purple-700">
                {t("findIn", { name: c.name.toLowerCase() })} →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
