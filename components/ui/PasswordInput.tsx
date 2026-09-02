"use client";

import { forwardRef, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

const inputBase =
  "h-11 w-full rounded-md border border-line-soft bg-surface-base pl-3.5 pr-11 text-sm text-ink-primary " +
  "placeholder:text-ink-tertiary transition-colors duration-250 ease-butter " +
  "focus:border-brand-purple-500 focus:outline-none focus:ring-2 focus:ring-brand-purple-200 " +
  "aria-[invalid=true]:border-state-danger aria-[invalid=true]:ring-state-danger/20";

/**
 * Password field with a show/hide toggle (QA Batch 1):
 * hidden by default, click or Enter/Space to reveal, click again to hide.
 * The toggle is a real <button> with an aria-label and aria-pressed state.
 */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(function PasswordInput({ className, ...rest }, ref) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(inputBase, className)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        title={visible ? t("hidePassword") : t("showPassword")}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-ink-tertiary transition-colors hover:text-brand-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-purple-600"
      >
        {visible ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M3 3l18 18M10.6 10.7a2 2 0 002.8 2.8M9.4 5.2A9.6 9.6 0 0112 5c5 0 9 4.5 10 7-0.4 1-1.4 2.5-2.9 3.8M6.1 6.2C4 7.6 2.6 9.7 2 12c1 2.5 5 7 10 7 1.6 0 3-.4 4.3-1"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
            <path
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        )}
      </button>
    </div>
  );
});
