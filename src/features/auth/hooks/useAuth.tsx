import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAuthStatus, type AuthStatus } from "@/core/auth/authGuards";
import { authService } from "@/core/auth/authService";
import type { AuthSession } from "@/features/auth/types/authTypes";

interface AuthContextValue {
  session: AuthSession | null;
  status: AuthStatus;
  isLoading: boolean;
  /** Verifies the OTP and persists the session. */
  confirmLoginOtp: (phone: string, code: string) => Promise<void>;
  acceptTerms: (version: number) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loaded = await authService.loadSession();
        if (!loaded) {
          if (!cancelled) setSession(null);
          return;
        }
        // Recheck on every cold start: a new TOS version routes to /terms.
        // Offline → keep the persisted session, recheck next launch.
        try {
          const fresh = await authService.refreshTosStatus(loaded);
          if (!cancelled) setSession(fresh);
        } catch {
          if (!cancelled) setSession(loaded);
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

  const confirmLoginOtp = useCallback(async (phone: string, code: string) => {
    const { session: next } = await authService.confirmLoginOtp(phone, code);
    setSession(next);
  }, []);

  const acceptTerms = useCallback(
    async (version: number) => {
      if (!session) throw new Error("No active session");
      const next = await authService.acceptTerms(session, version);
      setSession(next);
    },
    [session],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      status: isLoading ? "loading" : getAuthStatus(session),
      isLoading,
      confirmLoginOtp,
      acceptTerms,
      signOut,
    }),
    [session, isLoading, confirmLoginOtp, acceptTerms, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
