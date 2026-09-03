import { cn } from "@/lib/cn";

/** Warm, slightly gamified stat block — not an enterprise KPI tile (07 §10.3). */
export function StatCard({
  label,
  value,
  hint,
  tone = "cream",
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "cream" | "lavender" | "yellow";
  className?: string;
}) {
  const tones = {
    cream: "bg-surface-base",
    lavender: "bg-brand-lavender-100/70",
    yellow: "bg-brand-yellow-100/70",
  };
  return (
    <div className={cn("rounded-lg border border-line-soft p-4 shadow-soft", tones[tone], className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-ink-secondary">{hint}</p> : null}
    </div>
  );
}
