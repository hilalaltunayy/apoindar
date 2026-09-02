import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { auth } from "@/lib/auth";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  const session = await auth();
  const role = session?.user?.role;
  const dashboardHref =
    role === "PROVIDER" ? "/provider" : role === "ADMIN" ? "/admin" : "/dashboard";

  const nav = [
    { label: t("findTeacher"), href: "/search" },
    { label: t("categories"), href: "/categories" },
    { label: t("howItWorks"), href: "/how-it-works" },
    { label: t("forTeachers"), href: "/for-teachers" },
    { label: t("premium"), href: "/premium" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft/70 bg-bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-secondary transition-colors hover:text-brand-purple-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <Button href={dashboardHref} variant="secondary" size="sm">
              {t("dashboard")}
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                {t("logIn")}
              </Button>
              <Button href="/signup" size="sm">
                {t("signUp")}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
