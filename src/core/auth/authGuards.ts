import type { AuthSession } from "@/features/auth/types/authTypes";

export type AuthStatus = "loading" | "signed-out" | "needs-terms" | "signed-in";

/** Derives routing state from the persisted session. Used by group layouts. */
export function getAuthStatus(session: AuthSession | null): AuthStatus {
  if (!session) return "signed-out";
  if (!session.user.tosAcceptedAt) return "needs-terms";
  return "signed-in";
}
