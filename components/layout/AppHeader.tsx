import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/lib/auth";
import type { Role } from "@/lib/authz";

const STUDENT_NAV = [
  { label: "Search", href: "/search" },
  { label: "My Bookings", href: "/bookings" },
  { label: "My Packages", href: "/packages" },
];

const PROVIDER_NAV = [
  { label: "Dashboard", href: "/provider" },
  { label: "Calendar", href: "/provider/calendar" },
  { label: "Students", href: "/provider/students" },
  { label: "Lessons", href: "/provider/listings" },
  { label: "Bookings", href: "/provider/bookings" },
  { label: "Earnings", href: "/provider/earnings" },
];

export function AppHeader({ role, name }: { role: Role; name?: string | null }) {
  const nav = role === "PROVIDER" ? PROVIDER_NAV : STUDENT_NAV;
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
          {role === "STUDENT" ? (
            <Link href="/premium" className="hidden text-sm text-brand-purple-700 hover:underline sm:block">
              Teach on Apoindar
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
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
