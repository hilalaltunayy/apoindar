import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, NetworkError } from "./api";

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: "network" | "server" | "forbidden" | null;
  refetch: () => void;
  reloading: boolean;
};

/** Minimal data-fetch hook — no react-query, keeps the bundle lean. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [error, setError] = useState<AsyncState<T>["error"]>(null);
  const mounted = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (isReload: boolean) => {
    if (isReload) setReloading(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current();
      if (mounted.current) setData(result);
    } catch (e) {
      if (!mounted.current) return;
      if (e instanceof NetworkError) setError("network");
      else if (e instanceof ApiError && e.status === 403) setError("forbidden");
      else setError("server");
    } finally {
      if (mounted.current) {
        setLoading(false);
        setReloading(false);
      }
    }
  }, []);

  useEffect(() => {
    run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, reloading, error, refetch: () => run(true) };
}
