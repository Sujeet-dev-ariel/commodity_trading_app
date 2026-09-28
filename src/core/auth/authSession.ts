import { secureStorage } from "@/core/storage/secureStorage";
import type { AuthSession } from "@/features/auth/types/authTypes";

const SESSION_KEY = "auth.session.v1";

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await secureStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed?.token || !parsed?.user?.phone) return null;
    // Backfill sessions saved before `roles` existed.
    if (!Array.isArray(parsed.user.roles)) parsed.user.roles = [];
    return parsed;
  } catch {
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await secureStorage.deleteItem(SESSION_KEY);
}
