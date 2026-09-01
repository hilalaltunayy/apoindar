import type { Metadata } from "next";
import { Reveal } from "@/components/brand/Reveal";

export const metadata: Metadata = { title: "Trust & Safety" };

export default function TrustPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Reveal>
        <h1 className="text-3xl">Trust &amp; Safety</h1>
      </Reveal>
      <p className="text-ink-secondary">
        Apoindar is built so that booking and paying on-platform is genuinely better than
        doing it over chat.
      </p>
      <ul className="space-y-3 text-sm text-ink-secondary">
        <li>
          <strong>Payment records.</strong> Every paid lesson has a confirmation and a
          receipt you can refer back to.
        </li>
        <li>
          <strong>Cancellation &amp; refunds.</strong> Clear policies and a real refund
          process handled by Apoindar.
        </li>
        <li>
          <strong>Provider moderation.</strong> Teacher profiles are reviewed before they
          appear in search.
        </li>
        <li>
          <strong>Data protection.</strong> Server-side authorization on every action;
          private student data is never exposed to other providers.
        </li>
        <li>
          <strong>Complaints.</strong> Report a teacher, booking or listing and our team
          reviews it.
        </li>
      </ul>
      <p className="text-xs text-ink-tertiary">
        Formal Terms of Service and Privacy Policy are published before public launch.
      </p>
    </div>
  );
}
