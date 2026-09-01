"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Select, Input } from "@/components/ui/Field";
import { toMinor } from "@/lib/money";

const CATEGORIES = [
  ["", "All categories"],
  ["academic", "Academic"],
  ["languages", "Languages"],
  ["sports", "Sports"],
  ["music", "Music"],
  ["art-design", "Art & Design"],
  ["exam-prep", "Exam Preparation"],
] as const;

export function SearchFilters({
  facets,
}: {
  facets: { categorySlug?: string; city?: string; mode?: string; sort?: string; max?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  return (
    <aside className="space-y-5 rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
      <div>
        <p className="mb-1.5 text-sm font-medium">Category</p>
        <Select
          defaultValue={facets.categorySlug ?? ""}
          onChange={(e) => update("category", e.target.value)}
        >
          {CATEGORIES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">City or district</p>
        <Input
          defaultValue={facets.city ?? ""}
          placeholder="e.g. İstanbul or Online"
          onBlur={(e) => update("city", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("city", (e.target as HTMLInputElement).value.trim());
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Format</p>
        <div className="flex gap-2">
          {([
            ["", "Any"],
            ["ONLINE", "Online"],
            ["IN_PERSON", "In person"],
          ] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => update("mode", v)}
              className={`rounded-pill px-3 py-1 text-xs font-medium transition-colors ${
                (facets.mode ?? "") === v
                  ? "bg-brand-purple-600 text-white"
                  : "bg-brand-lavender-100 text-brand-purple-700"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Max price (₺ / lesson)</p>
        <Input
          type="number"
          min={0}
          step={50}
          defaultValue={facets.max ? String(Number(facets.max) / 100) : ""}
          onBlur={(e) => {
            const v = e.target.value.trim();
            update("max", v ? String(toMinor(Number(v))) : "");
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">Sort</p>
        <Select defaultValue={facets.sort ?? "relevance"} onChange={(e) => update("sort", e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </div>
    </aside>
  );
}
