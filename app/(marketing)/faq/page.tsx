import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Disclosure } from "@/components/ui/Disclosure";
import { Reveal } from "@/components/brand/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return { title: t("metaTitle") };
}

export default async function FaqPage() {
  const t = await getTranslations("faq");
  const items = [1, 2, 3, 4, 5, 6];

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl">{t("title")}</h1>
      </Reveal>
      <div className="space-y-3">
        {items.map((i) => (
          <Disclosure key={i} label={t(`q${i}`)}>
            <p className="text-sm text-ink-secondary">{t(`a${i}`)}</p>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
