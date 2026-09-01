"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function Disclosure({
  label,
  children,
  defaultOpen = false,
  className,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn("rounded-lg border border-line-soft bg-surface-base shadow-soft", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        aria-expanded={open}
      >
        {label}
        <span className={cn("transition-transform duration-250", open && "rotate-45")}>+</span>
      </button>
      <div hidden={!open} className="border-t border-line-soft p-4">
        {children}
      </div>
    </div>
  );
}
