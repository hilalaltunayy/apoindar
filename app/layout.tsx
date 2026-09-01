import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Apoindar — Find the right teacher. Achieve your goals.",
    template: "%s · Apoindar",
  },
  description:
    "Apoindar is a warm, modern marketplace to discover tutors and coaches, book securely, and keep your learning relationship in one place.",
  openGraph: { title: "Apoindar", type: "website", locale: "en" },
};

export const viewport: Viewport = {
  themeColor: "#FBF6EA",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">
        <LogoReveal />
        {children}
      </body>
    </html>
  );
}
