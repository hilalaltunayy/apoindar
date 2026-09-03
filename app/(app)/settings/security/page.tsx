import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/authz";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("security");
  return { title: t("metaTitle") };
}

export default async function SecurityPage() {
  await requireUser();
  const t = await getTranslations("security");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">{t("title")}</h1>
      <section>
        <h2 className="mb-3 text-lg">{t("changePassword")}</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
