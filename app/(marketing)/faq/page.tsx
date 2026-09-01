import type { Metadata } from "next";
import { Disclosure } from "@/components/ui/Disclosure";
import { Reveal } from "@/components/brand/Reveal";

export const metadata: Metadata = { title: "FAQ" };

const FAQ = ([
  ["Is Apoindar free for students?", "Yes. Students pay no subscription and no platform service fee in V1 — only the lesson or package price shown."],
  ["How do teachers get paid?", "Students pay in-platform at checkout. Apoindar takes a marketplace commission (12% Free, 7% Premium) and the rest is settled to the teacher. Payout scheduling is finalised with the payment provider."],
  ["What's the difference between Free and Premium?", "Free: 12% commission, 1 active listing, 3 active students, basic calendar. Premium (299₺/mo or 2 990₺/yr): 7% commission, unlimited listings and students, recurring lessons, advanced calendar and CRM, Growth Dashboard. 14-day free trial, no card."],
  ["What happens if I cancel Premium?", "You stay on Premium until the paid period ends, then move to Free. Nothing is deleted — extra listings become inactive and extra students stay saved but read-only for Premium tools."],
  ["Can I get a refund?", "Yes. Bookings follow the teacher's cancellation policy; refunds are processed through Apoindar and reflected in both the student's and teacher's records."],
  ["Is there a mobile app?", "A dedicated iOS and Android app is planned (React Native + Expo) using the same backend. The web app is fully responsive today."],
] as const);

export default function FaqPage() {
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-3xl">Frequently asked questions</h1>
      </Reveal>
      <div className="space-y-3">
        {FAQ.map(([q, a]) => (
          <Disclosure key={q} label={q}>
            <p className="text-sm text-ink-secondary">{a}</p>
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
