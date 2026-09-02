export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

/** Turkish is the default user-facing language (QA Batch 1 requirement). */
export const defaultLocale: Locale = "tr";

export const LOCALE_COOKIE = "apoindar_locale";

export const localeLabels: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};
