import { useCallback, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { authService } from "@/core/auth/authService";
import { formatPhoneDisplay } from "@/core/utils/validation";
import type { OtpChallenge } from "@/features/auth/api/authApi";
import { phoneSchema } from "@/features/auth/schemas/authSchemas";

/** Phone-entry step of login. Returns the normalized phone on success. */
export function useLogin() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /** Clears the field + all API messages (used when returning to this screen). */
  const reset = useCallback(() => {
    setPhone("");
    setError(null);
    setSuccess(null);
    setChallenge(null);
  }, []);

  async function submit(): Promise<{ phone: string; challenge: OtpChallenge } | null> {
    const parsed = phoneSchema.safeParse(phone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid mobile number");
      setSuccess(null);
      setChallenge(null);
      return null;
    }
    setError(null);
    setSuccess(null);
    setChallenge(null);
    setIsLoading(true);
    try {
      const result = await authService.requestLoginOtp(parsed.data);
      setChallenge(result);
      setSuccess(
        `Code sent to ${formatPhoneDisplay(result.phone)} — valid for ${result.expiresInSec}s.`,
      );
      return { phone: parsed.data, challenge: result };
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not send the code"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { phone, setPhone, error, success, challenge, isLoading, submit, reset };
}
