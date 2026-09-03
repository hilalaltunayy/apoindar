"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Signature search interaction (07 §12, 08 §3).
 * Idle: rotating examples type themselves into the "what" field.
 * On focus/typing: the animation stops immediately and never blocks input.
 */
function useTypedPlaceholder(active: boolean, EXAMPLES: string[]) {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const char = useRef(0);
  const dir = useRef<1 | -1>(1);

  useEffect(() => {
    if (!active) {
      setText("");
      return;
    }
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const gap = dir.current === 1 ? 90 : 45;
      if (t - last > gap) {
        last = t;
        const word = EXAMPLES[idx.current % EXAMPLES.length]!;
        char.current += dir.current;
        setText(word.slice(0, Math.max(0, char.current)));
        if (char.current >= word.length + 8) dir.current = -1;
        if (char.current <= 0 && dir.current === -1) {
          dir.current = 1;
          idx.current += 1;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, EXAMPLES]);

  return text;
}

export function AnimatedSearchField({ className }: { className?: string }) {
  const router = useRouter();
  const t = useTranslations("searchField");
  const tHome = useTranslations("home");
  const examples = (tHome.raw("searchExamples") as string[]) ?? [];
  const [what, setWhat] = useState("");
  const [where, setWhere] = useState("");
  const [focused, setFocused] = useState(false);
  const idle = !focused && what.length === 0;
  const typed = useTypedPlaceholder(idle, examples);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (what.trim()) params.set("q", what.trim());
    if (where.trim()) params.set("city", where.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border border-line-soft bg-surface-base p-2 shadow-raised sm:flex-row sm:items-center",
        className,
      )}
    >
      <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
        <span className="text-brand-purple-500" aria-hidden>
          🔍
        </span>
        <span className="sr-only">{t("what")}</span>
        <span className="relative flex-1">
          <input
            value={what}
            onChange={(e) => setWhat(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={idle ? "" : t("what")}
            className="w-full bg-transparent text-sm text-ink-primary outline-none placeholder:text-ink-tertiary"
            aria-label={t("what")}
          />
          {idle ? (
            <span
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-sm text-ink-tertiary"
              aria-hidden
            >
              {typed || t("what")}
              <span className="ml-0.5 inline-block w-px animate-caret bg-brand-purple-500">
                &nbsp;
              </span>
            </span>
          ) : null}
        </span>
      </label>

      <div className="hidden h-6 w-px bg-line-soft sm:block" />

      <label className="flex flex-1 items-center gap-2 rounded-xl px-3 py-2">
        <span className="text-brand-purple-500" aria-hidden>
          📍
        </span>
        <span className="sr-only">{t("whereLabel")}</span>
        <input
          value={where}
          onChange={(e) => setWhere(e.target.value)}
          placeholder={t("wherePlaceholder")}
          className="w-full bg-transparent text-sm text-ink-primary outline-none placeholder:text-ink-tertiary"
          aria-label={t("whereLabel")}
        />
      </label>

      <Button type="submit" size="lg" className="shrink-0">
        {t("submit")}
      </Button>
    </form>
  );
}
