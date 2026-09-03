import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { confirmEmail } from "@/lib/services/password";
import { DeepLinkBridge } from "@/components/auth/DeepLinkBridge";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "E-posta doğrulama" };

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("authLinks");

  if (!token) {
    return <p className="text-sm text-state-danger">{t("missingToken")}</p>;
  }

  const result = await confirmEmail(token);

  return (
    <DeepLinkBridge path="auth/confirm" token={token}>
      <div className="space-y-4 text-center">
        <div className="text-4xl">{result.ok ? "✅" : "⚠️"}</div>
        <h1 className="font-serif text-2xl">
          {result.ok ? t("confirmOkTitle") : t("confirmFailTitle")}
        </h1>
        <p className="text-sm text-ink-secondary">
          {result.ok ? t("confirmOkBody") : t("linkInvalidBody")}
        </p>
        <Button href={result.ok ? "/login" : "/signup"} className="w-full">
          {result.ok ? t("toLogin") : t("toSignup")}
        </Button>
        <Link href="/" className="block text-xs text-ink-tertiary">
          {t("home")}
        </Link>
      </div>
    </DeepLinkBridge>
  );
}
