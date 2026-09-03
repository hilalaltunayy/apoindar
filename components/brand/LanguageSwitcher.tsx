"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { changeLocaleAction } from "@/lib/actions/locale";
import { locales } from "@/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Unobtrusive TR / EN toggle. Locale is stored in a cookie (one app, no route
 * prefixes). Turkish is the default.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const active = useLocale();
  const [pending, start] = useTransition();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border border-line-soft bg-surface-base p-0.5 text-xs",
        pending && "opacity-60",
        className,
      )}
      role="group"
      aria-label="Language / Dil"
    >
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          aria-pressed={active === loc}
          disabled={pending}
          onClick={() => start(() => changeLocaleAction(loc))}
          className={cn(
            "rounded-pill px-2 py-0.5 font-medium uppercase transition-colors duration-250",
            active === loc
              ? "bg-brand-purple-600 text-white"
              : "text-ink-tertiary hover:text-ink-primary",
          )}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
