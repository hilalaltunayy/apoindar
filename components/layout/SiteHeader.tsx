import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { auth } from "@/lib/auth";

const NAV = [
  { label: "Find a Teacher", href: "/search" },
  { label: "Categories", href: "/categories" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Teachers", href: "/for-teachers" },
  { label: "Premium", href: "/premium" },
] as const;

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;
  const dashboardHref =
    role === "PROVIDER" ? "/provider" : role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft/70 bg-bg-cream/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
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
          {session?.user ? (
            <Button href={dashboardHref} variant="secondary" size="sm">
              Dashboard
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" size="sm">
                Log In
              </Button>
              <Button href="/signup" size="sm">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
