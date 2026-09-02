import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/brand/LanguageSwitcher";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  const columns = [
    {
      title: t("learn"),
      links: [
        { label: nav("findTeacher"), href: "/search" },
        { label: nav("categories"), href: "/categories" },
        { label: nav("howItWorks"), href: "/how-it-works" },
      ],
    },
    {
      title: t("teach"),
      links: [
        { label: nav("forTeachers"), href: "/for-teachers" },
        { label: nav("premium"), href: "/premium" },
        { label: t("becomeProvider"), href: "/signup?role=provider" },
      ],
    },
    {
      title: t("company"),
      links: [
        { label: t("trustSafety"), href: "/trust" },
        { label: t("faq"), href: "/faq" },
        { label: t("support"), href: "/support" },
      ],
    },
  ];

  return (
    <footer className="mt-20 border-t border-line-soft bg-bg-soft/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-ink-secondary">{t("tagline")}</p>
          <LanguageSwitcher />
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink-primary">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink-secondary transition-colors hover:text-brand-purple-700"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line-soft/70 px-4 py-6 text-center text-xs text-ink-tertiary">
        {t("rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  );
}
