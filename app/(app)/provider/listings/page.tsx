import type { Metadata } from "next";
import { requireProvider } from "@/lib/authz";
import { providerListings } from "@/lib/data/provider";
import { ListingManager } from "@/components/provider/ListingManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lessons & packages" };

export default async function ProviderListingsPage() {
  const { provider, plan, entitlements } = await requireProvider();
  const listings = await providerListings(provider.id);
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const canActivateMore = activeCount < entitlements.listingsMaxActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Lessons &amp; packages</h1>
        <p className="text-sm text-ink-secondary">
          {plan === "FREE"
            ? "Free plan: 1 active listing. Extra listings stay as drafts until you upgrade."
            : "Premium: unlimited active listings."}
        </p>
      </div>
      <ListingManager
        listings={listings.map((l) => ({
          id: l.id,
          title: l.title,
          kind: l.kind,
          status: l.status,
          priceAmount: l.priceAmount,
          currency: l.currency,
          lessonCount: l.lessonCount,
          durationMin: l.durationMin,
          bookings: l._count.bookings,
        }))}
        canActivateMore={canActivateMore}
        planLabel={plan === "FREE" ? "Free plan" : "Premium"}
      />
    </div>
  );
}
