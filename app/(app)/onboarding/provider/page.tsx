import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { currentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { OnboardingForm } from "@/components/provider/OnboardingForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("onboarding");
  return { title: t("metaTitle") };
}

export default async function ProviderOnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/onboarding/provider");
  if (user.role !== "PROVIDER") redirect("/dashboard");

  const t = await getTranslations("onboarding");
  const provider = await safeQuery(
    () =>
      prisma.provider.findUnique({
        where: { userId: user.id },
        include: {
          categories: { select: { category: { select: { slug: true } } } },
          _count: { select: { listings: { where: { status: "ACTIVE" } } } },
        },
      }),
    null,
  );
  if (!provider) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl">{t("title")}</h1>
      <p className="mb-6 mt-1 text-sm text-ink-secondary">{t("subtitle")}</p>
      <OnboardingForm
        initial={{
          displayName: provider.displayName,
          headline: provider.headline,
          bio: provider.bio,
          city: provider.city,
          district: provider.district,
          deliveryMode: provider.deliveryMode,
          yearsExperience: provider.yearsExperience,
          categorySlugs: provider.categories.map((c) => c.category.slug),
        }}
        hasActiveListing={provider._count.listings > 0}
        published={provider.published}
      />
    </div>
  );
}
