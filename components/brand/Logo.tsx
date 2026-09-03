import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";

/** Apoindar wordmark — final brand mark (purple calendar + clock + confirm) + serif wordmark (07 §2). */
export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
      aria-label="Apoindar home"
    >
      <Image
        src="/brand/apoindar-logo.png"
        alt=""
        width={32}
        height={32}
        priority
        className="h-8 w-8 rounded-xl shadow-purple transition-transform duration-250 ease-butter group-hover:-rotate-6"
      />
      <span className="font-serif text-xl font-semibold tracking-tight text-ink-primary">
        Apoindar
      </span>
    </Link>
  );
}
