import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const COLUMNS = [
  {
    title: "Learn",
    links: [
      { label: "Find a Teacher", href: "/search" },
      { label: "Categories", href: "/categories" },
      { label: "How It Works", href: "/how-it-works" },
    ],
  },
  {
    title: "Teach",
    links: [
      { label: "For Teachers", href: "/for-teachers" },
      { label: "Premium", href: "/premium" },
      { label: "Become a Provider", href: "/signup?role=provider" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Trust & Safety", href: "/trust" },
      { label: "FAQ", href: "/faq" },
      { label: "Support", href: "/support" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line-soft bg-bg-soft/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-ink-secondary">
            Find the right teacher. Achieve your goals. Book securely and keep the
            learning relationship in one place.
          </p>
        </div>
        {COLUMNS.map((col) => (
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
        © {new Date().getFullYear()} Apoindar. Prices in TRY. Students pay no platform fee.
      </div>
    </footer>
  );
}
