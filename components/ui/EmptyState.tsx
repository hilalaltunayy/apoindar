import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

/** Warm, optimistic empty state with a small premium illustration (07 §18, 11 §17). */
export function EmptyState({
  title,
  description,
  action,
  glyph = "✨",
  className,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  glyph?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-line-lavender bg-brand-lavender-100/50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-base text-2xl shadow-soft">
        {glyph}
      </div>
      <h3 className="font-serif text-lg">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-ink-secondary">{description}</p>
      ) : null}
      {action ? (
        <Button href={action.href} size="sm" className="mt-1">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
