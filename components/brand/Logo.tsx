import Link from "next/link";
import { cn } from "@/lib/cn";

/** Apoindar wordmark — "appointment" + "calendar", reduced to one p (07 §2). */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="Apoindar home"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-brand-purple-600 text-white shadow-purple transition-transform duration-250 ease-butter group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="14.5" r="2" fill="#F4C84A" />
        </svg>
      </span>
      <span className="font-serif text-xl font-semibold tracking-tight text-ink-primary">
        Apoindar
      </span>
    </Link>
  );
}
