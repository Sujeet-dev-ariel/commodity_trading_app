import { authApi } from "@/features/auth/api/authApi";
import { tosApi } from "@/features/auth/api/tosApi";
import type { AuthSession, TosVersion } from "@/features/auth/types/authTypes";
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
    // Fresh acceptance state: returning users skip terms unless a new
    // version was published. Offline → keep verify-otp data, recheck later.
    try {
      return { session: await authService.refreshTosStatus(session) };
    } catch {
      return { session };
    }
  },

  /** Current TOS document for the acceptance screen. */
  fetchCurrentTos(session: AuthSession): Promise<TosVersion> {
    return tosApi.current(session.token);
  },

  /**
   * Sync acceptance state from the server. A newly published version
   * flips `accepted` to false, which routes the user back to /terms.
   */
  async refreshTosStatus(session: AuthSession): Promise<AuthSession> {
    const status = await tosApi.status(session.token);
    const updated: AuthSession = {
      ...session,
      user: {
        ...session.user,
        tosAcceptedAt: status.accepted
          ? (status.acceptedAt ??
            session.user.tosAcceptedAt ??
            new Date().toISOString())
          : null,
        tosAcceptedVersion: status.accepted
          ? (status.acceptedVersion ?? status.currentVersion)
          : null,
      },
    };
    await saveSession(updated);
    return updated;
  },

  async acceptTerms(session: AuthSession, version: number): Promise<AuthSession> {
    const result = await tosApi.accept(version, session.token);
    const updated: AuthSession = {
      ...session,
      user: {
        ...session.user,
        tosAcceptedAt: result.acceptedAt ?? new Date().toISOString(),
        tosAcceptedVersion: result.acceptedVersion,
      },
    };
    await saveSession(updated);
    return updated;
  },

  async signOut(): Promise<void> {
    await clearSession();
  },
};
