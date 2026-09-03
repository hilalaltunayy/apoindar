import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { verifyAuthToken } from "@/lib/services/auth-tokens";
import { DeepLinkBridge } from "@/components/auth/DeepLinkBridge";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Şifre sıfırlama" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const t = await getTranslations("authLinks");

  if (!token) return <p className="text-sm text-state-danger">{t("missingToken")}</p>;

  const check = await verifyAuthToken(token, "PASSWORD_RESET");

  return (
    <DeepLinkBridge path="auth/reset" token={token}>
      {check.ok ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="space-y-4 text-center">
          <div className="text-4xl">⚠️</div>
          <h1 className="font-serif text-2xl">{t("linkInvalidTitle")}</h1>
          <p className="text-sm text-ink-secondary">{t("linkInvalidBody")}</p>
          <Button href="/forgot-password" className="w-full">
            {t("requestNew")}
          </Button>
        </div>
      )}
    </DeepLinkBridge>
  );
}
