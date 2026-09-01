"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Branded loader — educational motifs cycle while the purple tone deepens.
 * Replaces the generic spinner everywhere (07 §15.2, 11 §16).
 */
const GLYPHS = ["✏️", "📐", "🎓", "🎾", "🎵", "🌊", "🏀", "📚"];
const PURPLES = ["#B49BD9", "#9A7ACB", "#7450A6", "#5E3A86"];

export function BrandLoader({
  label = "Loading",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => n + 1), 420);
    return () => clearInterval(t);
  }, []);
  const color = PURPLES[Math.min(i, PURPLES.length - 1)];
  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-3 py-10", className)}
      role="status"
      aria-live="polite"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl transition-colors duration-400 ease-butter"
        style={{ borderColor: color, background: "rgba(255,253,248,0.7)" }}
      >
        <span key={i % GLYPHS.length} className="animate-pop">
          {GLYPHS[i % GLYPHS.length]}
        </span>
      </div>
      <span className="text-sm text-ink-secondary">{label}…</span>
    </div>
  );
}
