import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/brand/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("trust");
  return { title: t("metaTitle") };
}

export default async function TrustPage() {
  const t = await getTranslations("trust");
  const points = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl">{t("title")}</h1>
      </Reveal>
      <p className="text-ink-secondary">{t("intro")}</p>
      <ul className="space-y-3 text-sm text-ink-secondary">
        {points.map((i) => (
          <li key={i}>
            <strong>{t(`p${i}t`)}</strong> {t(`p${i}b`)}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-tertiary">{t("legalNote")}</p>
    </div>
  );
}
