import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { currentUser, getProviderContext } from "@/lib/authz";
import { PremiumCta } from "@/components/provider/PremiumCta";
import { Reveal } from "@/components/brand/Reveal";
import { formatMoney } from "@/lib/money";
import {
  PREMIUM_PRICE,
  PREMIUM_TRIAL_DAYS,
  PREMIUM_MONTHLY_BREAK_EVEN_VOLUME,
  COMMISSION_RATE,
} from "@/lib/config/commerce";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("premium");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

const ROW_KEYS = [
  "commission",
  "listings",
  "students",
  "calendar",
  "recurring",
  "crm",
  "growth",
  "reminders",
  "discovery",
] as const;

export default async function PremiumPage() {
  const t = await getTranslations("premium");
  const common = await getTranslations("common");
  const user = await currentUser();
  let state: React.ComponentProps<typeof PremiumCta>["state"] = "anon";
  if (user?.role === "STUDENT" || user?.role === "ADMIN") state = "student";
  else if (user?.role === "PROVIDER") {
    const ctx = await getProviderContext(user.id);
    state = ctx?.plan === "PREMIUM" ? "premium" : "free-provider";
  }

  const freePct = Math.round(COMMISSION_RATE.FREE * 100);
  const premiumPct = Math.round(COMMISSION_RATE.PREMIUM * 100);

  const rowValue = (key: (typeof ROW_KEYS)[number]) => {
    switch (key) {
      case "commission":
        return { free: `${freePct}%`, premium: `${premiumPct}%` };
      case "listings":
        return { free: t("vFreeListings"), premium: t("vPremiumUnlimited") };
      case "students":
        return { free: t("vFreeStudents"), premium: t("vPremiumUnlimited") };
      case "calendar":
        return { free: t("vFreeCalendar"), premium: t("vPremiumCalendar") };
      case "recurring":
      case "growth":
      case "reminders":
        return { free: t("vDash"), premium: t("vCheck") };
      case "crm":
        return { free: t("vFreeCrm"), premium: t("vPremiumCrm") };
      case "discovery":
        return { free: t("vFreeDiscovery"), premium: t("vPremiumDiscovery") };
    }
  };

  return (
    <div className="space-y-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-wider text-brand-purple-600">
          {t("kicker")}
        </p>
        <h1 className="mt-2 max-w-2xl text-4xl leading-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-xl text-lg text-ink-secondary">{t("subtitle")}</p>
      </Reveal>

      <Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line-soft bg-surface-base p-6 shadow-soft">
            <p className="font-serif text-lg">{t("freeTitle")}</p>
            <p className="mt-1 text-3xl font-semibold">{formatMoney(0)}</p>
            <p className="text-sm text-ink-secondary">{t("freeCommission", { rate: freePct })}</p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-secondary">
              <li>{t("freeBul1")}</li>
              <li>{t("freeBul2")}</li>
              <li>{t("freeBul3")}</li>
              <li>{t("freeBul4")}</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-brand-purple-400 bg-gradient-to-br from-brand-yellow-100/70 to-brand-lavender-100/70 p-6 shadow-raised">
            <p className="font-serif text-lg">{t("premiumTitle")}</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatMoney(PREMIUM_PRICE.MONTH)}
              <span className="text-base font-normal text-ink-secondary"> {common("perMonth")}</span>
            </p>
            <p className="text-sm text-ink-secondary">
              {t("premiumPerYear", { yearly: formatMoney(PREMIUM_PRICE.YEAR), rate: premiumPct })}
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>✓ {t("premiumBul1")}</li>
              <li>✓ {t("premiumBul2")}</li>
              <li>✓ {t("premiumBul3")}</li>
              <li>✓ {t("premiumBul4", { days: PREMIUM_TRIAL_DAYS })}</li>
            </ul>
            <div className="mt-5">
              <PremiumCta state={state} />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl bg-brand-lavender-100/60 p-6">
          <h2 className="text-2xl">{t("payForItselfTitle")}</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
            {t("payForItselfBody", {
              price: formatMoney(PREMIUM_PRICE.MONTH),
              breakeven: formatMoney(PREMIUM_MONTHLY_BREAK_EVEN_VOLUME),
            })}
          </p>
        </div>
      </Reveal>

      <Reveal>
        <h2 className="text-2xl">{t("compareTitle")}</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left">
                <th className="py-2 pr-4 font-medium">{t("colFeature")}</th>
                <th className="py-2 pr-4 font-medium">{t("colFree")}</th>
                <th className="py-2 font-medium text-brand-purple-700">{t("colPremium")}</th>
              </tr>
            </thead>
            <tbody>
              {ROW_KEYS.map((key) => {
                const v = rowValue(key)!;
                return (
                  <tr key={key} className="border-b border-line-soft/60">
                    <td className="py-2.5 pr-4 font-medium">{t(`rows.${key}`)}</td>
                    <td className="py-2.5 pr-4 text-ink-secondary">{v.free}</td>
                    <td className="py-2.5 text-ink-primary">{v.premium}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
