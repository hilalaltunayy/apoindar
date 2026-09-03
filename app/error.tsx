"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("states");
  const common = useTranslations("common");

  useEffect(() => {
    console.error("[app error]", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-lavender-100 text-2xl">
        🌧️
      </div>
      <h1 className="mt-4 font-serif text-2xl">{t("errorTitle")}</h1>
      <p className="mt-2 text-sm text-ink-secondary">{t("errorBody")}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>{common("tryAgain")}</Button>
        <Button href="/" variant="secondary">
          {common("goHome")}
        </Button>
      </div>
    </div>
  );
}
