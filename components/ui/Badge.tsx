import { cn } from "@/lib/cn";

type Tone = "purple" | "yellow" | "neutral" | "success" | "danger";

const tones: Record<Tone, string> = {
  purple: "bg-brand-purple-100 text-brand-purple-700",
  yellow: "bg-brand-yellow-100 text-brand-yellow-700",
  neutral: "bg-surface-muted text-ink-secondary",
  success: "bg-state-success-soft text-state-success",
  danger: "bg-state-danger-soft text-state-danger",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
