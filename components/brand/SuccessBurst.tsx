"use client";

/**
 * Branded success motion (07 §17). Yellow→purple transformation, a mini
 * celebration — not confetti overload. Respects reduced-motion via CSS.
 */
export function SuccessBurst() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center" aria-hidden>
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow-500 animate-pop">
        <div
          className="absolute inset-0 rounded-full bg-brand-purple-600"
          style={{ animation: "apoindar-breathe 1.4s ease-in-out 0.15s both", opacity: 0 }}
        />
        <svg viewBox="0 0 24 24" className="relative h-8 w-8 text-ink-primary" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
