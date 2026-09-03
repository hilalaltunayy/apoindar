import { Platform } from "react-native";
import { API_BASE_URL } from "./config";
import { tokenStore } from "./storage";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message?: string,
    readonly issues?: Record<string, string[]>,
  ) {
    super(message ?? code);
    this.name = "ApiError";
  }
}

/** Thrown on network failure — the UI shows the branded offline state. */
export class NetworkError extends Error {
  constructor() {
    super("network");
    this.name = "NetworkError";
  }
}

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOpts {
  method?: Method;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean;
  signal?: AbortSignal;
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

export async function api<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  // Build the query string by hand — Hermes' URL/searchParams support is partial.
  const qs = Object.entries(opts.query ?? {})
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  const url = `${API_BASE_URL}/api/mobile/v1${path}${qs ? `?${qs}` : ""}`;

  const headers: Record<string, string> = {
    accept: "application/json",
    "x-apoindar-platform": Platform.OS,
  };
  if (opts.body !== undefined) headers["content-type"] = "application/json";
  if (opts.auth !== false) {
    const token = await tokenStore.get();
    if (token) headers.authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });
  } catch {
    throw new NetworkError();
  }

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (res.status === 401) {
    const code = (data as { error?: string })?.error ?? "unauthenticated";
    if (code === "session_expired" || code === "token_invalid" || code === "no_account") {
      await tokenStore.clear();
      onUnauthorized?.();
    }
    throw new ApiError(401, code);
  }

  if (!res.ok) {
    const d = data as { error?: string; message?: string; code?: string; issues?: Record<string, string[]> };
    throw new ApiError(res.status, d?.code ?? d?.error ?? "error", d?.message, d?.issues);
  }

  return data as T;
}
