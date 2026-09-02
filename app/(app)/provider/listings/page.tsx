import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireProvider } from "@/lib/authz";
import { providerListings } from "@/lib/data/provider";
import { ListingManager } from "@/components/provider/ListingManager";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("listings");
  return { title: t("metaTitle") };
}

export default async function ProviderListingsPage() {
  const t = await getTranslations("listings");
  const common = await getTranslations("common");
  const { provider, plan, entitlements } = await requireProvider();
  const listings = await providerListings(provider.id);
  const activeCount = listings.filter((l) => l.status === "ACTIVE").length;
  const canActivateMore = activeCount < entitlements.listingsMaxActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">
          {plan === "FREE" ? t("subtitleFree") : t("subtitlePremium")}
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
        planLabel={plan === "FREE" ? common("free") : common("premium")}
      />
    </div>
  );
}
