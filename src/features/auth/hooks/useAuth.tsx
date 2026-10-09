import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { getAuthStatus, type AuthStatus } from "@/core/auth/authGuards";
import { authService } from "@/core/auth/authService";
import { ApiError, isUnauthorizedError } from "@/core/api/client";
import type { AuthSession } from "@/features/auth/types/authTypes";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  isLoading: boolean;
  /** Verifies the OTP and persists the session. */
  confirmLoginOtp: (phone: string, code: string) => Promise<void>;
  acceptTerms: (version: number) => Promise<void>;
  signOut: () => Promise<void>;
  /**
   * Runs an authenticated request with the current access token. On a 401
   * (access token expired — ~15m lifetime), refreshes once via
   * POST /auth/refresh and retries; when the refresh token is also dead,
   * signs out (guards redirect to login) and rethrows a friendly ApiError.
   */
  runWithAuth: <T>(fn: (token: string) => Promise<T>) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Refresh failures that mean "re-login": revoked/expired refresh token. */
function isRefreshDead(e: unknown): boolean {
  return e instanceof ApiError && (e.status === 401 || e.status === 403);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionRef = useRef<AuthSession | null>(null);
  useEffect(() => {
    sessionRef.current = session;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await authService.loadSession();
        if (!loaded) {
          if (!cancelled) setSession(null);
          return;
        }
        // Refresh-first cold start: access tokens live ~15m, so a returning
        // session is usually expired. Refresh BEFORE any screen fetches —
        // otherwise every screen shows "unauthorized" after reopen.
        let active = loaded;
        if (loaded.refreshToken) {
          try {
            active = await authService.refreshSession(loaded);
          } catch (e) {
            if (isRefreshDead(e)) {
              if (!cancelled) setSession(null);
              return;
            }
            // Offline/transient — keep the persisted session, recheck later.
          }
        }
        // Recheck on every cold start: a new TOS version routes to /terms.
        // Offline → keep the persisted session, recheck next launch.
        try {
          const fresh = await authService.refreshTosStatus(active);
          if (!cancelled) setSession(fresh);
        } catch {
          if (!cancelled) setSession(active);
        }
      } catch {
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Revalidate when returning from background (minimize → reopen) and
  // periodically while alive, so the 15m access token never goes stale.
  useEffect(() => {
    let cancelled = false;
    async function revalidate() {
      const current = sessionRef.current;
      if (!current?.refreshToken) return;
      try {
        const next = await authService.refreshSession(current);
        if (!cancelled) setSession(next);
      } catch (e) {
        if (isRefreshDead(e)) {
          if (!cancelled) setSession(null);
        }
        // Offline/transient — keep the current session.
      }
    }
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void revalidate();
    });
    const timer = setInterval(() => {
      void revalidate();
    }, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      sub.remove();
      clearInterval(timer);
    };
  }, []);

  const confirmLoginOtp = useCallback(async (phone: string, code: string) => {
    const { session: next } = await authService.confirmLoginOtp(phone, code);
    setSession(next);
  }, []);

  const acceptTerms = useCallback(
    async (version: number) => {
      const current = sessionRef.current;
      if (!current) throw new Error("No active session");
      const next = await authService.acceptTerms(current, version);
      setSession(next);
    },
    [],
  );

  const signOut = useCallback(async () => {
    await authService.signOut(sessionRef.current);
    setSession(null);
  }, []);

  const runWithAuth = useCallback(
    async <T,>(fn: (token: string) => Promise<T>): Promise<T> => {
      const current = sessionRef.current;
      if (!current?.token) {
        throw new ApiError(401, "Your session expired. Please sign in again.");
      }
      try {
        return await fn(current.token);
      } catch (e) {
        if (!isUnauthorizedError(e)) throw e;
        // Access token dead (e.g. expired while backgrounded) — refresh
        // once and retry. Refresh itself is single-flight server-side.
        let next: AuthSession;
        try {
          next = await authService.refreshSession(
            sessionRef.current ?? current,
          );
        } catch {
          await authService.signOut(sessionRef.current);
          setSession(null);
          throw new ApiError(
            401,
            "Your session expired. Please sign in again.",
          );
        }
        setSession(next);
        try {
          return await fn(next.token);
        } catch (retryErr) {
          if (isUnauthorizedError(retryErr)) {
            await authService.signOut(sessionRef.current);
            setSession(null);
            throw new ApiError(
              401,
              "Your session expired. Please sign in again.",
            );
          }
          throw retryErr;
        }
      }
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status: isLoading ? "loading" : getAuthStatus(session),
      isLoading,
      confirmLoginOtp,
      acceptTerms,
      signOut,
      runWithAuth,
    }),
    [session, isLoading, confirmLoginOtp, acceptTerms, signOut, runWithAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
