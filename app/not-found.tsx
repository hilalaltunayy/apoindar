import { getTranslations } from "next-intl/server";
import { MotifField } from "@/components/brand/MotifField";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("states");
  return (
    <>
      <MotifField intensity="loud" />
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4 text-center">
        <Logo />
        <h1 className="mt-8 font-serif text-3xl">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-ink-secondary">{t("notFoundBody")}</p>
        <div className="mt-6 flex gap-3">
          <Button href="/">{t("home")}</Button>
          <Button href="/search" variant="secondary">
            {t("findTeacher")}
          </Button>
        </div>
      </div>
    </>
  );
}
