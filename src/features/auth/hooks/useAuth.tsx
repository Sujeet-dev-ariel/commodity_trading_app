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
  acceptTerms: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authService
      .loadSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const confirmLoginOtp = useCallback(async (phone: string, code: string) => {
    const { session: next } = await authService.confirmLoginOtp(phone, code);
    setSession(next);
  }, []);

  const acceptTerms = useCallback(async () => {
    if (!session) throw new Error("No active session");
    const next = await authService.acceptTerms(session);
    setSession(next);
  }, [session]);

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
