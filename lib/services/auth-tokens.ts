import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { AuthTokenKind } from "@/lib/generated/prisma";

const TTL_MS: Record<AuthTokenKind, number> = {
  EMAIL_VERIFY: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Issue a single-use token; returns the RAW token (goes into the email / deep link). */
export async function issueAuthToken(userId: string, kind: AuthTokenKind): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  // one live token per (user, kind)
  await prisma.authToken.deleteMany({ where: { userId, kind, usedAt: null } });
  await prisma.authToken.create({
    data: { userId, kind, tokenHash: hash(raw), expiresAt: new Date(Date.now() + TTL_MS[kind]) },
  });
  return raw;
}

export type AuthTokenResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "not_found" | "expired" | "used" };

export async function verifyAuthToken(
  raw: string,
  kind: AuthTokenKind,
): Promise<AuthTokenResult> {
  const row = await prisma.authToken.findUnique({ where: { tokenHash: hash(raw) } });
  if (!row || row.kind !== kind) return { ok: false, reason: "not_found" };
  if (row.usedAt) return { ok: false, reason: "used" };
  if (row.expiresAt < new Date()) return { ok: false, reason: "expired" };
  return { ok: true, userId: row.userId };
}

/** Verify + mark used atomically. */
export async function consumeAuthToken(
  raw: string,
  kind: AuthTokenKind,
): Promise<AuthTokenResult> {
  const check = await verifyAuthToken(raw, kind);
  if (!check.ok) return check;
  const updated = await prisma.authToken.updateMany({
    where: { tokenHash: hash(raw), usedAt: null },
    data: { usedAt: new Date() },
  });
  if (updated.count === 0) return { ok: false, reason: "used" };
  return check;
}

/**
 * Where an auth link points. The email always links to the WEB origin; that page
 * (a) 302s into the app via the custom scheme when opened on a device with the
 * app, and (b) otherwise renders the web fallback (12 §4.2–4.3, §20).
 */
export function authLinkUrl(kind: AuthTokenKind, rawToken: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const path = kind === "EMAIL_VERIFY" ? "/auth/confirm" : "/auth/reset";
  return `${base}${path}?token=${encodeURIComponent(rawToken)}`;
}
