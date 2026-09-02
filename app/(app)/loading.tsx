import { getTranslations } from "next-intl/server";
import { BrandLoader } from "@/components/ui/BrandLoader";

export default async function Loading() {
  const t = await getTranslations("common");
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <BrandLoader label={t("loadingSpace")} />
    </div>
  );
}
