import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";
import { signOut } from "@/lib/auth";
import type { Role } from "@/lib/authz";

export async function AppHeader({ role, name }: { role: Role; name?: string | null }) {
  const t = await getTranslations("nav");

  const studentNav = [
    { label: t("search"), href: "/search" },
    { label: t("myBookings"), href: "/bookings" },
    { label: t("myPackages"), href: "/packages" },
  ];
  const providerNav = [
    { label: t("dashboard"), href: "/provider" },
    { label: t("calendar"), href: "/provider/calendar" },
    { label: t("students"), href: "/provider/students" },
    { label: t("lessons"), href: "/provider/listings" },
    { label: t("bookings"), href: "/provider/bookings" },
    { label: t("earnings"), href: "/provider/earnings" },
  ];
  const nav = role === "PROVIDER" ? providerNav : studentNav;
  const home = role === "PROVIDER" ? "/provider" : role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft/70 bg-bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Logo href={home} />
          <nav className="hidden items-center gap-5 md:flex">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className="text-sm text-ink-secondary transition-colors hover:text-brand-purple-700"
              >
                {i.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {role === "STUDENT" ? (
            <Link
              href="/premium"
              className="hidden text-sm text-brand-purple-700 hover:underline sm:block"
            >
              {t("teachOnApoindar")}
            </Link>
          ) : null}
          <span className="hidden text-sm text-ink-tertiary sm:block">{name}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="rounded-pill border border-line-soft px-3 py-1.5 text-sm hover:bg-brand-lavender-100">
              {t("logOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
