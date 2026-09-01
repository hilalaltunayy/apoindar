import type { Metadata } from "next";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";
import { COMMISSION_RATE, PREMIUM_PRICE, PREMIUM_TRIAL_DAYS } from "@/lib/config/commerce";

export const metadata: Metadata = { title: "For teachers" };

export default function ForTeachersPage() {
  return (
    <div className="space-y-16">
      <Reveal>
        <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
          Turn your empty hours into income.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-secondary">
          Apoindar helps you get discovered, sell lessons and packages, manage students
          and schedule, and keep more of what you earn.
        </p>
        <div className="mt-6 flex gap-3">
          <Button href="/signup?role=provider">Create a free profile</Button>
          <Button href="/premium" variant="secondary">
            See Premium
          </Button>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-line-soft bg-surface-base p-6 shadow-soft">
            <h2 className="font-serif text-lg">Free</h2>
            <p className="text-sm text-ink-secondary">
              {Math.round(COMMISSION_RATE.FREE * 100)}% commission · 1 active listing · 3 active students ·
              basic calendar & analytics. A real, usable plan — not a demo.
            </p>
          </div>
          <div className="rounded-xl border-2 border-brand-purple-400 bg-brand-lavender-100/60 p-6 shadow-soft">
            <h2 className="font-serif text-lg">Premium — {formatMoney(PREMIUM_PRICE.MONTH)}/mo</h2>
            <p className="text-sm text-ink-secondary">
              {Math.round(COMMISSION_RATE.PREMIUM * 100)}% commission · unlimited listings & students ·
              recurring lessons · advanced calendar & CRM · Growth Dashboard · {PREMIUM_TRIAL_DAYS}-day
              free trial, no card.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="rounded-2xl bg-brand-yellow-100/50 p-6">
          <h2 className="text-2xl">Why students book on-platform</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-secondary">
            Secure payment records, booking confirmations, a real cancellation and refund
            process, package tracking and reminders. It’s better for them — and it means
            your business, payouts and student history live in one place.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
