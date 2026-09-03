"use client";

import { useEffect, useState } from "react";

/**
 * Email links always point at the web origin. When the Apoindar app is
 * installed, iOS Universal Links / Android App Links open the app directly and
 * this page is never rendered. If the OS falls back to the browser, we make ONE
 * attempt to hand off to the app via its custom scheme, then reveal the web
 * fallback (12 §4.2–4.3, §20). A valid token is NEVER left on a generic login.
 */
export function DeepLinkBridge({
  path,
  token,
  children,
}: {
  path: "auth/confirm" | "auth/reset";
  token: string;
  children: React.ReactNode;
}) {
  const [showWeb, setShowWeb] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scheme = `apoindar://${path}?token=${encodeURIComponent(token)}`;
    const t = setTimeout(() => setShowWeb(true), 1200);
    // Best-effort scheme handoff; harmless on desktop (no handler → nothing).
    try {
      window.location.href = scheme;
    } catch {
      /* ignore */
    }
    return () => clearTimeout(t);
  }, [path, token]);

  return (
    <div>
      {!showWeb ? (
        <p className="text-sm text-ink-secondary">Apoindar uygulaması açılıyor… / Opening the Apoindar app…</p>
      ) : (
        children
      )}
    </div>
  );
}
