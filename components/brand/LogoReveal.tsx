"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";

/**
 * Brand reveal (07 §15.1). Short, premium, not overlong. Runs once per session,
 * respects reduced-motion, and never blocks interaction beyond ~1s.
 */
export function LogoReveal() {
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("apoindar:revealed");
    if (reduce || seen) return;
    setDone(false);
    sessionStorage.setItem("apoindar:revealed", "1");
    const t = setTimeout(() => setDone(true), 1100);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-cream"
      style={{ animation: "apoindar-breathe 1.1s ease-in-out" }}
      aria-hidden
    >
      <div className="animate-pop">
        <Logo href="/" className="scale-150" />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, rgba(244,200,74,0.16), rgba(94,58,134,0.10) 60%, transparent 75%)",
        }}
      />
    </div>
  );
}
