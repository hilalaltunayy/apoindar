import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyMobileToken, type MobileTokenPayload } from "@/lib/mobile-api/token";
import { AuthorizationError } from "@/lib/authz";

export interface MobileUser {
  id: string;
  role: "STUDENT" | "PROVIDER" | "ADMIN";
  name: string | null;
  email: string;
  emailVerified: boolean;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

/** Resolve the bearer token → user, validating the passwordChangedAt cutoff (12 §4). */
export async function authenticate(req: Request): Promise<MobileUser> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new ApiError(401, "unauthenticated");

  const payload = verifyMobileToken(token);
  if (!payload) throw new ApiError(401, "token_invalid");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      role: true,
      name: true,
      email: true,
      emailVerified: true,
      passwordChangedAt: true,
    },
  });
  if (!user) throw new ApiError(401, "no_account");
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    throw new ApiError(401, "session_expired");
  }
  return {
    id: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    emailVerified: !!user.emailVerified,
  };
}

type Ctx<A> = { req: Request; params: Record<string, string>; user: MobileUser | null; body: A };

interface RouteOpts<A> {
  auth?: boolean;
  role?: "STUDENT" | "PROVIDER" | "ADMIN";
  body?: ZodSchema<A>;
}

/**
 * Wrap a mobile route handler: auth, role, zod body validation, and uniform
 * error → JSON mapping. Never leak internals.
 */
export function route<A = unknown>(
  opts: RouteOpts<A>,
  fn: (ctx: Ctx<A>) => Promise<unknown>,
) {
  return async (
    req: Request,
    context: { params: Promise<Record<string, string>> },
  ): Promise<NextResponse> => {
    try {
      const params = await context.params;
      let user: MobileUser | null = null;
      if (opts.auth || opts.role) {
        user = await authenticate(req);
        if (opts.role && user.role !== opts.role) throw new ApiError(403, "forbidden");
      }
      let body = undefined as A;
      if (opts.body) {
        const raw =
          req.method === "GET" || req.method === "DELETE"
            ? Object.fromEntries(new URL(req.url).searchParams)
            : await req.json().catch(() => ({}));
        body = opts.body.parse(raw);
      }
      const data = await fn({ req, params, user, body });
      return json(data ?? { ok: true });
    } catch (err) {
      if (err instanceof ApiError) return json({ error: err.code, message: err.message }, err.status);
      if (err instanceof ZodError) {
        return json({ error: "validation", issues: err.flatten().fieldErrors }, 422);
      }
      if (err instanceof AuthorizationError) {
        return json({ error: "forbidden", code: err.code, message: err.message }, err.status);
      }
      console.error("[mobile-api]", (err as Error).stack ?? err);
      return json({ error: "server_error" }, 500);
    }
  };
}

export type { MobileTokenPayload };
