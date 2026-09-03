import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/brand/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("support");
  return { title: t("metaTitle") };
}

export default async function SupportPage() {
  const t = await getTranslations("support");
  return (
    <div className="max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl">{t("title")}</h1>
      </Reveal>
      <p className="text-ink-secondary">{t("intro")}</p>
      <div className="rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
        <p className="text-sm">
          {t.rich("body1", {
            faq: (chunks) => (
              <Link href="/faq" className="text-brand-purple-700 underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="mt-3 text-sm text-ink-secondary">{t("body2")}</p>
      </div>
    </div>
  );
}
