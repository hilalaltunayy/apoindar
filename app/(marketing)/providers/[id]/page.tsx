import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from "next-intl/server";
import { getProviderProfile } from "@/lib/data/discovery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/brand/Reveal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = await getProviderProfile(id);
  const t = await getTranslations("provider");
  return {
    title: provider ? `${provider.displayName} — ${provider.headline ?? t("metaTitleFallback")}` : t("metaTitleFallback"),
  };
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const provider = await getProviderProfile(id);
  if (!provider) notFound();

  const t = await getTranslations("provider");
  const common = await getTranslations("common");
  const locale = await getLocale();
  const df = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const modeKey =
    provider.deliveryMode === "ONLINE"
      ? "online"
      : provider.deliveryMode === "IN_PERSON"
        ? "inPerson"
        : "onlineAndInPerson";
  const location =
    provider.city && provider.district
      ? `${provider.district}, ${provider.city}`
      : (provider.city ?? common(modeKey));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-10">
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0">
              <div className="absolute -left-2 -top-2 h-40 w-40 rounded-2xl bg-brand-yellow-200" />
              <div
                className="relative h-40 w-40 overflow-hidden rounded-2xl border border-line-soft bg-surface-muted"
                style={{ viewTransitionName: `provider-photo-${provider.id}` }}
              >
                {provider.photoUrl ? (
                  <Image
                    src={provider.photoUrl}
                    alt={provider.displayName}
                    fill
                    sizes="160px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl">🎓</div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl">{provider.displayName}</h1>
                {provider.plan === "PREMIUM" ? <Badge tone="purple">{common("premium")}</Badge> : null}
              </div>
              {provider.headline ? (
                <p className="mt-1 text-lg text-ink-secondary">{provider.headline}</p>
              ) : null}
              <p className="mt-2 text-sm text-ink-tertiary">
                {provider.categories.map((c) => c.category.name).join(" · ")} • {location} •{" "}
                {common(modeKey)}
              </p>
              {provider.yearsExperience ? (
                <p className="mt-1 text-sm text-ink-tertiary">
                  {t("yearsTeaching", { years: provider.yearsExperience })}
                </p>
              ) : null}
              <p className="mt-3 text-sm">
                <span className="text-ink-tertiary">{common("from")} </span>
                <span className="text-xl font-semibold">
                  {provider.startingPrice != null
                    ? formatMoney(provider.startingPrice, provider.currency)
                    : "—"}
                </span>
              </p>
            </div>
          </div>
        </Reveal>

        {provider.bio ? (
          <Reveal>
            <section>
              <h2 className="text-xl">{t("about")}</h2>
              <p className="mt-2 whitespace-pre-line text-ink-secondary">{provider.bio}</p>
            </section>
          </Reveal>
        ) : null}

        <Reveal>
          <section>
            <h2 className="text-xl">{t("lessonsAndPackages")}</h2>
            {provider.listings.length ? (
              <div className="mt-3 space-y-3">
                {provider.listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex flex-col gap-3 rounded-lg border border-line-soft bg-surface-base p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{l.title}</h3>
                        <Badge tone={l.kind === "PACKAGE" ? "yellow" : "neutral"}>
                          {l.kind === "PACKAGE"
                            ? t("packageLessons", { count: l.lessonCount })
                            : common("singleLesson")}
                        </Badge>
                      </div>
                      {l.description ? (
                        <p className="mt-1 text-sm text-ink-secondary">{l.description}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-ink-tertiary">
                        {l.durationMin} {common("minutes")} •{" "}
                        {common(
                          l.deliveryMode === "ONLINE"
                            ? "online"
                            : l.deliveryMode === "IN_PERSON"
                              ? "inPerson"
                              : "onlineAndInPerson",
                        )}
                        {l.packageTerms ? ` • ${l.packageTerms}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-semibold">{formatMoney(l.priceAmount, l.currency)}</span>
                      <Button href={`/book/${l.id}`} size="sm">
                        {l.kind === "PACKAGE" ? t("buyPackage") : t("book")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState className="mt-3" glyph="📋" title={t("noOffersTitle")} description={t("noOffersBody")} />
            )}
          </section>
        </Reveal>

        <Reveal>
          <section>
            <h2 className="text-xl">{t("nextAvailable")}</h2>
            {provider.availability.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {provider.availability.slice(0, 12).map((s) => (
                  <span
                    key={s.id}
                    className="rounded-pill border border-line-soft bg-surface-base px-3 py-1.5 text-sm"
                  >
                    {df.format(s.startsAt)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-ink-secondary">{t("noSlotsBody")}</p>
            )}
          </section>
        </Reveal>

        <p className="text-xs text-ink-tertiary">{t("reviewsNote")}</p>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <div className="card-surface p-5 shadow-raised">
          <p className="font-serif text-lg">{t("bookWith", { name: provider.displayName.split(" ")[0] })}</p>
          <p className="mt-1 text-sm text-ink-secondary">{t("bookPanelBody")}</p>
          <p className="mt-3 text-sm">
            <span className="text-ink-tertiary">{common("from")} </span>
            <span className="text-lg font-semibold">
              {provider.startingPrice != null
                ? formatMoney(provider.startingPrice, provider.currency)
                : "—"}
            </span>
          </p>
          {provider.listings[0] ? (
            <Button href={`/book/${provider.listings[0].id}`} className="mt-4 w-full">
              {t("bookALesson")}
            </Button>
          ) : (
            <Button href="/search" variant="secondary" className="mt-4 w-full">
              {t("findAnother")}
            </Button>
          )}
          <p className="mt-3 text-center text-xs text-ink-tertiary">
            {t("lessonsBooked", { count: provider._count.bookings })}
          </p>
        </div>
      </aside>
    </div>
  );
}
