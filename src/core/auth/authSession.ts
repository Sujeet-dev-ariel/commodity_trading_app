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
    // Backfill sessions saved before the profile fields existed
    // (PATCH /users/me wiring) — server values refresh on next load.
    if (parsed.user.city === undefined) parsed.user.city = null;
    if (parsed.user.firmNotes === undefined) parsed.user.firmNotes = null;
    if (parsed.user.defaultPaymentTerms === undefined) parsed.user.defaultPaymentTerms = null;
    if (parsed.user.defaultWeightKg === undefined) parsed.user.defaultWeightKg = null;
    if (parsed.user.status === undefined) parsed.user.status = null;
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
