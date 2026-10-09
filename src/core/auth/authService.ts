import { ApiError } from "@/core/api/client";
import { authApi } from "@/features/auth/api/authApi";
import { tosApi } from "@/features/auth/api/tosApi";
import type { AuthSession, TosVersion } from "@/features/auth/types/authTypes";
import { clearSession, loadSession, saveSession } from "./authSession";

/**
 * Single-flight guard: parallel 401s / foreground events share one refresh
 * call instead of hammering POST /auth/refresh.
 */
let inflightRefresh: Promise<AuthSession> | null = null;

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

  /**
   * Exchange the stored refresh token for a fresh access token and persist it.
   * Single-flight: concurrent callers share one network request.
   * Throws when there is no refresh token or the server rejects it (401/403)
   * — the caller must treat that as signed-out (clear + redirect to login).
   */
  refreshSession(session: AuthSession): Promise<AuthSession> {
    if (!session.refreshToken) {
      return Promise.reject(
        new ApiError(401, "Your session expired. Please sign in again."),
      );
    }
    if (!inflightRefresh) {
      inflightRefresh = (async () => {
        try {
          const token = await authApi.refreshAccessToken(
            session.refreshToken as string,
          );
          const updated: AuthSession = { ...session, token };
          await saveSession(updated);
          return updated;
        } catch (e) {
          // Refresh token invalid/revoked/expired — nothing left to keep.
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
            await clearSession();
          }
          throw e;
        } finally {
          inflightRefresh = null;
        }
      })();
    }
    return inflightRefresh;
  },

  async signOut(session?: AuthSession | null): Promise<void> {
    // Revoke the 30-day refresh token server-side (best-effort), then clear.
    const refreshToken = session?.refreshToken;
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Offline or already revoked — local clear is what matters.
      }
    }
    await clearSession();
  },
};
