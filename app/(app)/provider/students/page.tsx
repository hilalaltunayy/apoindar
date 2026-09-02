import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireProvider } from "@/lib/authz";
import { providerStudents } from "@/lib/data/provider";
import { StudentManager } from "@/components/provider/StudentManager";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("crm");
  return { title: t("metaTitle") };
}

export default async function ProviderStudentsPage() {
  const t = await getTranslations("crm");
  const { provider, plan, entitlements } = await requireProvider();
  const students = await providerStudents(provider.id);
  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const canAddActive = activeCount < entitlements.studentsMaxActive;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">{t("title")}</h1>
        <p className="text-sm text-ink-secondary">
          {plan === "FREE" ? t("subtitleFree", { count: activeCount }) : t("subtitlePremium")}
        </p>
      </div>
      <StudentManager
        students={students.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          status: s.status,
          labelColor: s.labelColor,
          lessons: s._count.lessonInstances,
          bookings: s._count.bookings,
          lastListing: s.bookings[0]?.listing.title,
          notes: s.notes.map((n) => ({
            id: n.id,
            body: n.body,
            createdAt: n.createdAt.toISOString(),
          })),
        }))}
        canAddActive={canAddActive}
        advancedCrm={entitlements.advancedCrm}
        freeLimitReached={plan === "FREE" && !canAddActive}
      />
    </div>
  );
}
