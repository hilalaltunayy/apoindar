import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, ApiError, setUnauthorizedHandler } from "./api";
import { tokenStore } from "./storage";

export type Role = "STUDENT" | "PROVIDER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface ProviderSummary {
  id: string;
  displayName: string | null;
  headline: string | null;
  city: string | null;
  district: string | null;
  photoUrl: string | null;
  published: boolean;
  onboardingStep: string | null;
  plan: "FREE" | "PREMIUM";
  currency: string;
}

export interface Entitlements {
  plan: "FREE" | "PREMIUM";
  commissionRate: number;
  maxActiveListings: number | null;
  maxActiveStudents: number | null;
  recurringLessons: boolean;
  advancedCalendar: boolean;
  advancedStudentManagement: boolean;
  [k: string]: unknown;
}

interface MeResponse {
  user: AuthUser;
  provider: ProviderSummary | null;
  entitlements?: Entitlements;
}

interface AuthValue {
  status: "loading" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  provider: ProviderSummary | null;
  entitlements: Entitlements | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: SignupInput) => Promise<{ emailVerificationSent: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Re-read /me after a mutation (plan change, profile publish, email confirm). */
  reloadProfile: () => Promise<void>;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: Extract<Role, "STUDENT" | "PROVIDER">;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthValue["status"]>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [provider, setProvider] = useState<ProviderSummary | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const applyMe = useCallback((me: MeResponse) => {
    if (!mounted.current) return;
    setUser(me.user);
    setProvider(me.provider);
    setEntitlements(me.entitlements ?? null);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(async () => {
    await tokenStore.clear();
    if (!mounted.current) return;
    setUser(null);
    setProvider(null);
    setEntitlements(null);
    setStatus("unauthenticated");
  }, []);

  const loadFromToken = useCallback(async () => {
    const token = await tokenStore.get();
    if (!token) {
      if (mounted.current) setStatus("unauthenticated");
      return;
    }
    try {
      const me = await api<MeResponse>("/me");
      applyMe(me);
    } catch (e) {
      // 401 → session expired / password changed elsewhere; anything else keeps
      // us cautious and signs out so we never render a half-authed UI.
      if (e instanceof ApiError) {
        await clearSession();
      } else if (mounted.current) {
        // network error at boot — treat as unauthenticated but keep token so a
        // later retry can recover the session.
        setStatus("unauthenticated");
      }
    }
  }, [applyMe, clearSession]);

  // Global 401 handler: any API call that hits an expired/invalid session
  // forces us back to the unauthenticated state.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
  }, [clearSession]);

  useEffect(() => {
    void loadFromToken();
  }, [loadFromToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api<{ token: string; user: AuthUser }>("/auth/login", {
        method: "POST",
        auth: false,
        body: { email: email.trim().toLowerCase(), password },
      });
      await tokenStore.set(res.token);
      const me = await api<MeResponse>("/me");
      applyMe(me);
    },
    [applyMe],
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const res = await api<{
        token: string;
        user: AuthUser;
        emailVerificationSent: boolean;
      }>("/auth/signup", {
        method: "POST",
        auth: false,
        body: {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          password: input.password,
          role: input.role,
        },
      });
      await tokenStore.set(res.token);
      const me = await api<MeResponse>("/me");
      applyMe(me);
      return { emailVerificationSent: res.emailVerificationSent };
    },
    [applyMe],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const reloadProfile = useCallback(async () => {
    try {
      const me = await api<MeResponse>("/me");
      applyMe(me);
    } catch {
      /* keep current state; a 401 is handled by the global handler */
    }
  }, [applyMe]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      provider,
      entitlements,
      login,
      signup,
      logout,
      refresh: loadFromToken,
      reloadProfile,
    }),
    [status, user, provider, entitlements, login, signup, logout, loadFromToken, reloadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Convenience: the home route for the current session. */
export function homeRouteFor(user: AuthUser | null): string {
  if (!user) return "/(auth)/welcome";
  if (user.role === "PROVIDER") return "/(provider)/dashboard";
  return "/(student)/home";
}
