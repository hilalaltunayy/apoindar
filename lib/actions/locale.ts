"use server";

import { revalidatePath } from "next/cache";
import { setUserLocale } from "@/i18n/locale";
import { locales, type Locale } from "@/i18n/config";

export async function changeLocaleAction(locale: string) {
  if (!locales.includes(locale as Locale)) return;
  await setUserLocale(locale as Locale);
  revalidatePath("/", "layout");
}
