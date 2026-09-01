import type { Metadata } from "next";
import { Reveal } from "@/components/brand/Reveal";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "How it works" };

const STUDENT = [
  ["Search", "Tell us what you want to learn and where. Filter by price, format and category."],
  ["Choose a teacher", "Read profiles, compare lessons and packages, check availability."],
  ["Book & pay securely", "Pick a time, review the cancellation policy, and pay inside Apoindar."],
  ["Keep learning", "Track your package, reschedule when needed, and rebook with one tap."],
];

const TEACHER = [
  ["Create a profile", "Add your categories, location, experience and a photo — free."],
  ["Publish one lesson or package", "Free teachers get one active listing; Premium is unlimited."],
  ["Set availability", "Add open slots. Premium adds recurring lessons and templates."],
  ["Get paid", "Students pay in-platform. You keep 88% on Free, 93% on Premium."],
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-16">
      <Reveal>
        <h1 className="text-3xl">How Apoindar works</h1>
      </Reveal>
      {[
        ["For students", STUDENT],
        ["For teachers", TEACHER],
      ].map(([title, steps]) => (
        <Reveal key={title as string}>
          <h2 className="text-2xl">{title as string}</h2>
          <ol className="mt-4 space-y-4">
            {(steps as string[][]).map(([t, b], i) => (
              <li key={t} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-brand-purple-600 font-serif text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="text-sm text-ink-secondary">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      ))}
      <div className="flex gap-3">
        <Button href="/search">Find a teacher</Button>
        <Button href="/signup?role=provider" variant="secondary">
          Start teaching
        </Button>
      </div>
    </div>
  );
}
