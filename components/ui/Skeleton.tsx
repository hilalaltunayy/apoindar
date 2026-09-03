import { cn } from "@/lib/cn";

/** Branded cream/lavender skeleton — never a flat gray block (07 §15.3, 11 §16). */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("apoindar-skeleton", className)} aria-hidden />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function ProviderCardSkeleton() {
  return (
    <div className="card-surface p-5">
      <div className="flex gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="mt-4 h-9 w-32 rounded-pill" />
    </div>
  );
}
