import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Compact JWT (HS256) for the native apps, signed with AUTH_SECRET — the same
 * secret NextAuth uses, so there is one session authority (12 §16, §23).
 * Stored by the app in expo-secure-store; sent as `Authorization: Bearer`.
 */
const ALG = { alg: "HS256", typ: "JWT" };
const TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface MobileTokenPayload {
  sub: string; // userId
  role: "STUDENT" | "PROVIDER" | "ADMIN";
  iat: number;
  exp: number;
  /** issued-at cutoff check happens against user.passwordChangedAt on verify. */
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is required to sign mobile tokens");
  return s;
}

export function signMobileToken(userId: string, role: MobileTokenPayload["role"]): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: MobileTokenPayload = { sub: userId, role, iat: now, exp: now + TTL_SECONDS };
  const head = b64url(JSON.stringify(ALG));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

export function verifyMobileToken(token: string): MobileTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expected = createHmac("sha256", secret()).update(`${head}.${body}`).digest("base64url");
  const a = Buffer.from(sig!);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body!, "base64url").toString()) as MobileTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
