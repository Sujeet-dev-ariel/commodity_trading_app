import { authApi } from "@/features/auth/api/authApi";
import type { AuthSession } from "@/features/auth/types/authTypes";
import { clearSession, loadSession, saveSession } from "./authSession";

/**
 * App-level auth orchestration: API calls + session persistence.
 * Screens/hooks talk to this (via useAuth), never to authApi directly.
 */
export const authService = {
  loadSession,

  requestLoginOtp(phone: string) {
    return authApi.requestOtp(phone);
  },

  async confirmLoginOtp(
    phone: string,
    code: string,
  ): Promise<{ session: AuthSession }> {
    const result = await authApi.verifyOtp({ phone, code });
    const session: AuthSession = {
      token: result.token,
      ...(result.refreshToken ? { refreshToken: result.refreshToken } : {}),
      user: result.user.phone ? result.user : { ...result.user, phone },
    };
    await saveSession(session);
    return { session };
  },

  async acceptTerms(session: AuthSession): Promise<AuthSession> {
    const updated: AuthSession = {
      ...session,
      user: { ...session.user, tosAcceptedAt: new Date().toISOString() },
    };
    await saveSession(updated);
    return updated;
  },

  async signOut(): Promise<void> {
    await clearSession();
  },
};
