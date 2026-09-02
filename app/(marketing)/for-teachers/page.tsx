import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import { COMMISSION_RATE, PREMIUM_PRICE, PREMIUM_TRIAL_DAYS } from "@/lib/config/commerce";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("forTeachers");
  return { title: t("metaTitle") };
}

export default async function ForTeachersPage() {
  const t = await getTranslations("forTeachers");
  const free = Math.round(COMMISSION_RATE.FREE * 100);
  const premium = Math.round(COMMISSION_RATE.PREMIUM * 100);

  return (
    <div className="space-y-16">
      <Reveal>
        <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-secondary">{t("subtitle")}</p>
        <div className="mt-6 flex gap-3">
          <Button href="/signup?role=provider">{t("createFreeProfile")}</Button>
          <Button href="/premium" variant="secondary">
            {t("seePremium")}
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line-soft bg-surface-base p-6 shadow-soft">
            <h2 className="font-serif text-lg">{t("freeTitle")}</h2>
            <p className="text-sm text-ink-secondary">{t("freeBody", { free })}</p>
          </div>
          <div className="rounded-xl border-2 border-brand-purple-400 bg-brand-lavender-100/60 p-6 shadow-soft">
            <h2 className="font-serif text-lg">
              {t("premiumTitle", { price: formatMoney(PREMIUM_PRICE.MONTH) })}
            </h2>
            <p className="text-sm text-ink-secondary">
              {t("premiumBody", { premium, days: PREMIUM_TRIAL_DAYS })}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl bg-brand-yellow-100/50 p-6">
          <h2 className="text-2xl">{t("whyTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-secondary">{t("whyBody")}</p>
        </div>
      </Reveal>
    </div>
  );
}
