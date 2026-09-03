import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "purple";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-pill font-sans font-semibold " +
  "transition-[transform,box-shadow,background-color,color] duration-250 ease-butter " +
  "active:translate-y-px disabled:pointer-events-none disabled:opacity-50 " +
  // brush-swipe fill: a colored layer wipes across on hover (07 §11.2)
  "before:absolute before:inset-0 before:-z-0 before:origin-left before:scale-x-0 " +
  "before:rounded-pill before:transition-transform before:duration-400 before:ease-butter " +
  "hover:before:scale-x-100 [&>span]:relative [&>span]:z-10";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-yellow-500 text-ink-primary shadow-cta hover:shadow-purple before:bg-brand-purple-600 hover:text-white",
  purple:
    "bg-brand-purple-600 text-white shadow-purple before:bg-brand-yellow-500 hover:text-ink-primary",
  secondary:
    "border border-brand-purple-300 bg-brand-lavender-100 text-brand-purple-700 hover:bg-brand-lavender-200 before:bg-transparent",
  ghost: "text-brand-purple-700 hover:bg-brand-lavender-100 before:bg-transparent",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-[3.25rem] px-8 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "href"> & { href: string };

export const Button = forwardRef<HTMLButtonElement, ButtonAsButton | ButtonAsLink>(
  function Button({ variant = "primary", size = "md", className, children, ...rest }, ref) {
    const classes = cn(base, variants[variant], sizes[size], className);
    if ("href" in rest && typeof rest.href === "string") {
      const { href, ...linkRest } = rest as ButtonAsLink;
      return (
        <Link href={href} className={classes} {...linkRest}>
          <span>{children}</span>
        </Link>
      );
    }
    return (
      <button ref={ref} className={classes} {...(rest as ButtonAsButton)}>
        <span>{children}</span>
      </button>
    );
  },
);
