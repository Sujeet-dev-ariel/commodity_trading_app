import { useCallback, useEffect, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { User } from "@/features/auth/types/authTypes";
import {
  profileApi,
  type MyProfile,
  type UpdateProfileInput,
} from "@/features/shared/profile/api/profileApi";

/** Copy server profile fields onto the cached session user. */
export function profileToSessionPartial(profile: MyProfile): Partial<User> {
  return {
    id: profile.id,
    phone: profile.phone,
    name: profile.name ?? "",
    firmName: profile.firmName ?? "",
    roles: profile.roles,
    city: profile.city,
    firmNotes: profile.firmNotes,
    defaultPaymentTerms: profile.defaultPaymentTerms,
    defaultWeightKg: profile.defaultWeightKg,
    status: profile.status,
    tosAcceptedVersion: profile.tosAcceptedVersion,
    tosAcceptedAt: profile.tosAcceptedAt,
  };
}

/**
 * Own profile (`GET /users/me`) with save (`PATCH /users/me`).
 * Successful loads/saves sync the cached session user so the profile
 * header and identity stay current without re-login.
 */
export function useMyProfile() {
  const { runWithAuth, mergeSessionUser } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // runWithAuth refreshes the 15m access token on 401 and retries once.
      const fresh = await runWithAuth((token) => profileApi.getMe(token));
      setProfile(fresh);
      await mergeSessionUser(profileToSessionPartial(fresh));
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not load your profile"));
    } finally {
      setIsLoading(false);
    }
  }, [runWithAuth, mergeSessionUser]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  /** Save editable fields; returns true on success. */
  const save = useCallback(
    async (input: UpdateProfileInput): Promise<boolean> => {
      setIsSaving(true);
      setSaveError(null);
      setSaved(false);
      try {
        const updated = await runWithAuth((token) =>
          profileApi.updateMe(token, input),
        );
        setProfile(updated);
        await mergeSessionUser(profileToSessionPartial(updated));
        setSaved(true);
        return true;
      } catch (e) {
        setSaveError(getFriendlyApiError(e, "Could not save your profile"));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [runWithAuth, mergeSessionUser],
  );

  return {
    profile,
    isLoading,
    error,
    retry: load,
    save,
    isSaving,
    saveError,
    saved,
  };
}
