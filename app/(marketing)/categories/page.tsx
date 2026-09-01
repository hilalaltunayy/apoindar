import type { Metadata } from "next";
import Link from "next/link";
import { listCategories } from "@/lib/data/discovery";
import { Reveal } from "@/components/brand/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories" };

const FALLBACK = [
  { slug: "academic", name: "Academic", group: "Academic", icon: "📘" },
  { slug: "languages", name: "Languages", group: "Languages", icon: "🗣️" },
  { slug: "sports", name: "Sports", group: "Sports", icon: "🎾" },
  { slug: "music", name: "Music", group: "Music", icon: "🎵" },
  { slug: "art-design", name: "Art & Design", group: "Art & Design", icon: "🎨" },
  { slug: "exam-prep", name: "Exam Preparation", group: "Exam Preparation", icon: "🎯" },
];

export default async function CategoriesPage() {
  const db = await listCategories();
  const cats = db.length ? db : FALLBACK;

  return (
    <div className="space-y-8">
      <Reveal>
        <h1 className="text-3xl">Browse by category</h1>
        <p className="mt-2 text-ink-secondary">Every category has both Free and Premium teachers.</p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cats.map((c, i) => (
          <Reveal key={c.slug} delay={i * 40}>
            <Link
              href={`/search?category=${c.slug}`}
              className="flex h-full flex-col gap-2 rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-raised"
            >
              <span className="text-3xl">{c.icon ?? "✦"}</span>
              <span className="font-serif text-lg">{c.name}</span>
              <span className="text-sm text-brand-purple-700">Find {c.name.toLowerCase()} teachers →</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
