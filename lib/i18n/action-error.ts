"use client";

import { useTranslations } from "next-intl";

type Result = { ok: false; error: string; code?: string } | { ok: true } | null | undefined;

/**
 * Resolve a server-action failure to localized text: prefer the stable `code`
 * (mapped via `entitlementErrors`), fall back to the raw server message.
 */
export function useActionError() {
  const t = useTranslations("entitlementErrors");
  return (result: Result): string | null => {
    if (!result || result.ok) return null;
    if (result.code && t.has(result.code)) return t(result.code);
    return result.error || t("generic");
  };
}
