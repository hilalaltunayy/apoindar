import { ProviderCardSkeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="space-y-6">
      <div className="apoindar-skeleton h-9 w-48" />
      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="apoindar-skeleton h-72 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
