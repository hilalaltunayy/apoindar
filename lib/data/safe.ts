import "server-only";

/**
 * Run a DB query, returning `fallback` if the database is unreachable or
 * unconfigured. Keeps public pages rendering (with empty/seed states) before
 * DATABASE_URL is wired up, without masking real logic errors in dev logs.
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[safeQuery] falling back:", (err as Error).message);
    }
    return fallback;
  }
}
