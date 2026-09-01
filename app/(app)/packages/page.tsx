import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/authz";
import { studentPackages } from "@/lib/data/student";
import { EmptyState } from "@/components/ui/EmptyState";
import { packageProgress, remainingCredits, isPackageComplete } from "@/lib/domain/package-credit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My packages" };

export default async function PackagesPage() {
  const user = await requireUser();
  const packages = await studentPackages(user.id);

  if (!packages.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl">My packages</h1>
        <EmptyState
          glyph="📦"
          title="No packages yet"
          description="Buy a lesson package from a teacher to track your progress here."
          action={{ label: "Browse teachers", href: "/search" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">My packages</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((p) => {
          const pct = Math.round(packageProgress(p) * 100);
          return (
            <div key={p.id} className="rounded-lg border border-line-soft bg-surface-base p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <p className="font-serif text-lg">{p.booking.listing.title}</p>
                {isPackageComplete(p) ? (
                  <span className="rounded-pill bg-state-success-soft px-2 py-0.5 text-xs text-state-success">
                    Complete
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-ink-secondary">{p.booking.provider.displayName}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-pill bg-brand-lavender-100">
                <div
                  className="h-full rounded-pill bg-brand-purple-500 transition-[width] duration-600 ease-butter"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-2 text-sm">
                <span className="font-semibold">{p.consumedCount}</span> of {p.purchasedCount} lessons used ·{" "}
                <span className="text-ink-secondary">{remainingCredits(p)} remaining</span>
              </p>
              <Link
                href={`/providers/${p.booking.provider.id}`}
                className="mt-3 inline-block text-sm text-brand-purple-700 hover:underline"
              >
                Book the next lesson →
              </Link>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-tertiary">
        A private workspace with your teacher unlocks here in a later phase, once a paid package is active.
      </p>
    </div>
  );
}
