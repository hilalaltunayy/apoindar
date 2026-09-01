import type { Metadata } from "next";
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
export const metadata: Metadata = {
  title: "Premium",
  description: "Get more students, manage your teaching business, and keep more of what you earn.",
};

const COMPARISON: { feature: string; free: string; premium: string }[] = [
  { feature: "Marketplace commission", free: "12%", premium: "7%" },
  { feature: "Active lessons / packages", free: "1", premium: "Unlimited" },
  { feature: "Active students", free: "3", premium: "Unlimited" },
  { feature: "Calendar", free: "Day/week, availability, one-time lessons", premium: "+ recurring, templates, bulk, colours" },
  { feature: "Recurring lessons", free: "—", premium: "✓" },
  { feature: "Student management", free: "Basic card & history", premium: "Notes, credits, payments, revenue, filters" },
  { feature: "Growth Dashboard & analytics", free: "—", premium: "✓" },
  { feature: "Automated reminders", free: "—", premium: "✓" },
  { feature: "Discovery", free: "Fully discoverable", premium: "+ controlled visibility boost" },
];

export default async function PremiumPage() {
  const user = await currentUser();
  let state: React.ComponentProps<typeof PremiumCta>["state"] = "anon";
  if (user?.role === "STUDENT" || user?.role === "ADMIN") state = "student";
  else if (user?.role === "PROVIDER") {
    const ctx = await getProviderContext(user.id);
    state = ctx?.plan === "PREMIUM" ? "premium" : "free-provider";
  }

  return (
    <div className="space-y-16">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-wider text-brand-purple-600">Apoindar Premium</p>
        <h1 className="mt-2 max-w-2xl text-4xl leading-tight sm:text-5xl">
          Get more students, manage your business, and keep more of what you earn.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-secondary">
          Premium isn’t a badge. It’s a lower commission plus the scheduling, student
          management and analytics tools a real teaching business needs.
        </p>
      </Reveal>

      <Reveal>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-line-soft bg-surface-base p-6 shadow-soft">
            <p className="font-serif text-lg">Free</p>
            <p className="mt-1 text-3xl font-semibold">{formatMoney(0)}</p>
            <p className="text-sm text-ink-secondary">{Math.round(COMMISSION_RATE.FREE * 100)}% commission</p>
            <ul className="mt-4 space-y-1.5 text-sm text-ink-secondary">
              <li>1 active lesson or package</li>
              <li>3 active students</li>
              <li>Basic calendar & analytics</li>
              <li>Fully discoverable in search</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-brand-purple-400 bg-gradient-to-br from-brand-yellow-100/70 to-brand-lavender-100/70 p-6 shadow-raised">
            <p className="font-serif text-lg">Premium</p>
            <p className="mt-1 text-3xl font-semibold">
              {formatMoney(PREMIUM_PRICE.MONTH)}
              <span className="text-base font-normal text-ink-secondary"> / month</span>
            </p>
            <p className="text-sm text-ink-secondary">
              or {formatMoney(PREMIUM_PRICE.YEAR)} / year · {Math.round(COMMISSION_RATE.PREMIUM * 100)}% commission
            </p>
            <ul className="mt-4 space-y-1.5 text-sm">
              <li>✓ Unlimited lessons, packages & students</li>
              <li>✓ Recurring lessons & advanced calendar</li>
              <li>✓ Full student CRM & Growth Dashboard</li>
              <li>✓ {PREMIUM_TRIAL_DAYS}-day free trial, no card</li>
            </ul>
            <div className="mt-5">
              <PremiumCta state={state} />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl bg-brand-lavender-100/60 p-6">
          <h2 className="text-2xl">Does Premium pay for itself?</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
            The commission gap is 5 percentage points (12% → 7%). At{" "}
            {formatMoney(PREMIUM_PRICE.MONTH)}/month, a teacher processing about{" "}
            <strong>{formatMoney(PREMIUM_MONTHLY_BREAK_EVEN_VOLUME)}</strong> of lessons
            through Apoindar each month recovers the Premium price from commission savings
            alone — before counting the extra tools.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <h2 className="text-2xl">Free vs Premium</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[540px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left">
                <th className="py-2 pr-4 font-medium">Feature</th>
                <th className="py-2 pr-4 font-medium">Free</th>
                <th className="py-2 font-medium text-brand-purple-700">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((r) => (
                <tr key={r.feature} className="border-b border-line-soft/60">
                  <td className="py-2.5 pr-4 font-medium">{r.feature}</td>
                  <td className="py-2.5 pr-4 text-ink-secondary">{r.free}</td>
                  <td className="py-2.5 text-ink-primary">{r.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>
    </div>
  );
}
