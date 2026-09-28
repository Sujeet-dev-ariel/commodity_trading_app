import { useEffect, useState } from "react";
import { getFriendlyApiError } from "@/core/api/client";
import { authService } from "@/core/auth/authService";
import { otpSchema } from "@/features/auth/schemas/authSchemas";
import { useAuth } from "./useAuth";

const RESEND_COOLDOWN_SEC = 30;

/** OTP verification step. Returns true on success, null on validation/API failure. */
export function useOtp(phone: string) {
  const { confirmLoginOtp } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SEC);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function verify(): Promise<boolean> {
    const parsed = otpSchema.safeParse(code);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter the 4-digit code");
      return false;
    }
    setError(null);
    setNotice(null);
    setIsLoading(true);
    try {
      await confirmLoginOtp(phone, parsed.data);
      setNotice("Code verified — continuing…");
      return true;
    } catch (e) {
      setError(getFriendlyApiError(e, "Verification failed"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function resend(): Promise<void> {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const result = await authService.requestLoginOtp(phone);
      setCooldown(RESEND_COOLDOWN_SEC);
      setError(null);
      setNotice(`New code sent — valid for ${result.expiresInSec}s.`);
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not resend the code"));
    } finally {
      setIsResending(false);
    }
  }

  return { code, setCode, error, notice, isLoading, isResending, cooldown, verify, resend };
}
