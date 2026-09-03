"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Select, Input } from "@/components/ui/Field";
import { toMinor } from "@/lib/money";

const CATEGORY_SLUGS = [
  "",
  "academic",
  "languages",
  "sports",
  "music",
  "art-design",
  "exam-prep",
] as const;

export function SearchFilters({
  facets,
}: {
  facets: { categorySlug?: string; city?: string; mode?: string; sort?: string; max?: string };
}) {
  const t = useTranslations("search");
  const tn = useTranslations("categoriesPage.names");
  const common = useTranslations("common");
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

  const formatOptions = [
    { v: "", l: t("formatAny") },
    { v: "ONLINE", l: common("online") },
    { v: "IN_PERSON", l: common("inPerson") },
  ];

  return (
    <aside className="space-y-5 rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
      <div>
        <p className="mb-1.5 text-sm font-medium">{t("filterCategory")}</p>
        <Select
          defaultValue={facets.categorySlug ?? ""}
          onChange={(e) => update("category", e.target.value)}
        >
          {CATEGORY_SLUGS.map((slug) => (
            <option key={slug || "all"} value={slug}>
              {slug === "" ? t("filterAllCategories") : tn(slug)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">{t("filterCity")}</p>
        <Input
          defaultValue={facets.city ?? ""}
          placeholder={t("filterCityPlaceholder")}
          onBlur={(e) => update("city", e.target.value.trim())}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("city", (e.target as HTMLInputElement).value.trim());
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">{t("filterFormat")}</p>
        <div className="flex gap-2">
          {formatOptions.map(({ v, l }) => (
            <button
              key={v || "any"}
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
        <p className="mb-1.5 text-sm font-medium">{t("filterMaxPrice")}</p>
        <Input
          type="number"
          min={0}
          step={50}
          defaultValue={facets.max ? String(Number(facets.max) / 100) : ""}
          onBlur={(e) => {
            const val = e.target.value.trim();
            update("max", val ? String(toMinor(Number(val))) : "");
          }}
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium">{t("filterSort")}</p>
        <Select
          defaultValue={facets.sort ?? "relevance"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="relevance">{t("sortRelevance")}</option>
          <option value="price_asc">{t("sortPriceAsc")}</option>
          <option value="price_desc">{t("sortPriceDesc")}</option>
        </Select>
      </div>
    </aside>
  );
}
