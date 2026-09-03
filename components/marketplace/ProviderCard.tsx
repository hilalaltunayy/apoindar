import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { ProviderCardData } from "@/lib/data/discovery";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

function modeLabelKey(mode: ProviderCardData["deliveryMode"]) {
  return mode === "ONLINE" ? "online" : mode === "IN_PERSON" ? "inPerson" : "onlineAndInPerson";
}

/**
 * Branded provider card with editorial photo treatment (07 §8.3):
 * colored backdrop shape behind the portrait, soft depth, the image lifts
 * slightly outside the frame. Shared-transition anchor via view-transition-name.
 */
export async function ProviderCard({
  provider,
  priority = false,
}: {
  provider: ProviderCardData;
  priority?: boolean;
}) {
  const t = await getTranslations("search");
  const common = await getTranslations("common");

  const location =
    provider.city && provider.district
      ? `${provider.district}, ${provider.city}`
      : (provider.city ?? common(modeLabelKey(provider.deliveryMode)));

  return (
    <Link
      href={`/providers/${provider.id}`}
      className="group block rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft transition-[transform,box-shadow] duration-250 ease-butter hover:-translate-y-0.5 hover:shadow-raised"
    >
      <div className="flex gap-4">
        <div className="relative h-24 w-24 shrink-0">
          <div className="absolute -left-1 -top-1 h-24 w-24 rounded-2xl bg-brand-lavender-200 transition-transform duration-250 ease-butter group-hover:rotate-3" />
          <div
            className="relative h-24 w-24 overflow-hidden rounded-2xl border border-line-soft bg-surface-muted"
            style={{ viewTransitionName: `provider-photo-${provider.id}` }}
          >
            {provider.photoUrl ? (
              <Image
                src={provider.photoUrl}
                alt={provider.displayName}
                fill
                sizes="96px"
                className="object-cover"
                priority={priority}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🎓</div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-serif text-base font-semibold">{provider.displayName}</h3>
            {provider.plan === "PREMIUM" ? <Badge tone="purple">{common("premium")}</Badge> : null}
          </div>
          {provider.headline ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-ink-secondary">{provider.headline}</p>
          ) : null}
          <p className="mt-1 text-xs text-ink-tertiary">
            {provider.categories
              .slice(0, 2)
              .map((c) => c.name)
              .join(" · ") || common("teacher")}{" "}
            • {location}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm">
          {provider.startingPrice != null ? (
            <>
              <span className="text-ink-tertiary">{common("from")} </span>
              <span className="font-semibold">
                {formatMoney(provider.startingPrice, provider.currency)}
              </span>
            </>
          ) : (
            <span className="text-ink-tertiary">{t("askForPricing")}</span>
          )}
        </span>
        <span
          className={cn(
            "rounded-pill bg-brand-yellow-100 px-3 py-1 text-xs font-semibold text-brand-yellow-700",
            "transition-colors duration-250 group-hover:bg-brand-purple-600 group-hover:text-white",
          )}
        >
          {t("viewProfile")}
        </span>
      </div>
    </Link>
  );
}
