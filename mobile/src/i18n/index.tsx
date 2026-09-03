import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { en, type Messages } from "./en";
import { tr } from "./tr";

export type Locale = "tr" | "en";
const DEFAULT_LOCALE: Locale = "tr"; // Turkish is the default (12 §5)
const STORAGE_KEY = "apoindar.locale";
const DICTS: Record<Locale, Messages> = { tr, en };

type Path = string;

function resolve(dict: Messages, path: Path): string {
  const val = path.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[k];
    return undefined;
  }, dict);
  return typeof val === "string" ? val : path;
}

function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => Promise<void>;
  t: (key: Path, params?: Record<string, string | number>) => string;
  ready: boolean;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as Locale | null;
        if (stored === "tr" || stored === "en") {
          setLocaleState(stored);
        } else {
          const device = Localization.getLocales()[0]?.languageCode;
          setLocaleState(device === "en" ? "en" : "tr"); // default to Turkish
        }
      } catch {
        setLocaleState(DEFAULT_LOCALE);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* non-fatal */
    }
  }, []);

  const t = useCallback(
    (key: Path, params?: Record<string, string | number>) =>
      interpolate(resolve(DICTS[locale] ?? en, key), params),
    [locale],
  );

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t, ready }), [locale, setLocale, t, ready]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Locale-aware date formatting. */
export function useDateFormat() {
  const { locale } = useI18n();
  return useMemo(() => {
    const loc = locale === "tr" ? "tr-TR" : "en-GB";
    return {
      short: (d: Date) =>
        new Intl.DateTimeFormat(loc, {
          weekday: "short",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(d),
      day: (d: Date) =>
        new Intl.DateTimeFormat(loc, { weekday: "short", day: "numeric", month: "short" }).format(d),
      time: (d: Date) => new Intl.DateTimeFormat(loc, { hour: "2-digit", minute: "2-digit" }).format(d),
      dateTime: (d: Date) =>
        new Intl.DateTimeFormat(loc, { dateStyle: "medium", timeStyle: "short" }).format(d),
    };
  }, [locale]);
}
