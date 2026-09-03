"use client";

import { useTranslations } from "next-intl";
import { checkPassword, PASSWORD_RULES } from "@/lib/domain/password-policy";

/** Live, accessible password-criteria checklist (12 §4.1). */
export function PasswordCriteria({ value }: { value: string }) {
  const t = useTranslations("passwordPolicy");
  const { passed } = checkPassword(value);
  const set = new Set(passed);
  return (
    <ul className="mt-1.5 space-y-1" aria-label={t("label")}>
      {PASSWORD_RULES.map((r) => {
        const ok = set.has(r.id);
        return (
          <li
            key={r.id}
            className={`flex items-center gap-1.5 text-xs ${ok ? "text-state-success" : "text-ink-tertiary"}`}
          >
            <span aria-hidden>{ok ? "✓" : "○"}</span>
            <span>{t(r.id)}</span>
            <span className="sr-only">{ok ? t("met") : t("notMet")}</span>
          </li>
        );
      })}
    </ul>
  );
}
