import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { LogoReveal } from "@/components/brand/LogoReveal";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    title: {
      default: `Apoindar — ${t("titleLine1")} ${t("titleLine2")}`,
      template: "%s · Apoindar",
    },
    description: t("subtitle"),
    openGraph: { title: "Apoindar", type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: "#FBF6EA",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <LogoReveal />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
