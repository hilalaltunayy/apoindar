import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/brand/Reveal";

export const metadata: Metadata = { title: "Support" };

export default function SupportPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl">Support</h1>
      </Reveal>
      <p className="text-ink-secondary">
        Need help with a booking, payment or your teacher profile?
      </p>
      <div className="rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
        <p className="text-sm">
          Check the <Link href="/faq" className="text-brand-purple-700 underline">FAQ</Link> first —
          it covers pricing, refunds, Premium and downgrades.
        </p>
        <p className="mt-3 text-sm text-ink-secondary">
          Still stuck? A support inbox and in-app help are part of the next phase. For now,
          your bookings and payments pages show the current state of every transaction.
        </p>
      </div>
    </div>
  );
}
