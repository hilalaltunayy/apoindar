import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/authz";
import { prisma } from "@/lib/prisma";
import { safeQuery } from "@/lib/data/safe";
import { OnboardingForm } from "@/components/provider/OnboardingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Set up your teacher profile" };

export default async function ProviderOnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/onboarding/provider");
  if (user.role !== "PROVIDER") redirect("/dashboard");

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
        <h1 className="text-2xl">Set up your teacher profile</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          We couldn’t load your provider record. It’s created automatically when you sign up as a
          teacher — try signing up again or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl">Set up your teacher profile</h1>
      <p className="mb-6 mt-1 text-sm text-ink-secondary">
        Free teachers can complete this without paying. Premium is optional.
      </p>
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
