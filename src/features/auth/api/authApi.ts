import { ApiError, apiFetch } from "@/core/api/client";
import { AUTH_ENDPOINTS, apiUrl } from "@/core/api/endpoints";
import type {
  User,
  VerifyOtpInput,
  VerifyOtpResult,
} from "@/features/auth/types/authTypes";

export interface OtpChallenge {
  phone: string;
  expiresInSec: number;
}

/** Fallback when the backend omits the OTP lifetime. */
const DEFAULT_OTP_EXPIRY_SEC = 120;

function toPositiveNumber(v: unknown): number | null {
  const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

/** Backend sends `{ success: true, data: {...} }`; older docs show a flat shape. Accept both. */
function normalizeChallenge(raw: unknown, fallbackPhone: string): OtpChallenge {
  const root = (raw !== null && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const inner = root["data"];
  const data =
    inner !== null && typeof inner === "object"
      ? (inner as Record<string, unknown>)
      : root;
  const phone =
    (typeof data["phone"] === "string" && data["phone"]) ||
    (typeof root["phone"] === "string" && root["phone"]) ||
    fallbackPhone;
  const expiresInSec =
    toPositiveNumber(data["expiresInSec"]) ??
    toPositiveNumber(data["expiresIn"]) ??
    toPositiveNumber(root["expiresInSec"]) ??
    DEFAULT_OTP_EXPIRY_SEC;
  return { phone, expiresInSec };
}

/** Backend user keys vary; coerce to the app `User` shape with safe defaults. */
function normalizeUser(raw: unknown): User {
  if (!raw || typeof raw !== "object") {
    throw new ApiError(
      500,
      "Unexpected server response to OTP verification (missing user).",
    );
  }
  const u = raw as Record<string, unknown>;
  const pick = (...keys: string[]): string | null => {
    for (const k of keys) {
      const v = u[k];
      if (typeof v === "string" && v.trim()) return v;
    }
    return null;
  };
  const id = pick("id", "_id", "userId", "sub") ?? "";
  const phone = pick("phone", "phoneNumber", "mobile", "mobileNumber") ?? "";
  const name = pick("name", "fullName", "displayName", "username") ?? "";
  const firmName = pick("firmName", "firm", "company", "companyName", "shopName") ?? "";
  const tosRaw = u["tosAcceptedAt"] ?? u["termsAcceptedAt"];
  // Backend may send `roles: ["buyer"]`, a singular `role`/`userType` string,
  // or mixed casing — accept all, normalize to lowercase.
  const rolesRaw = u["roles"];
  const singleRaw = u["role"] ?? u["userType"] ?? u["type"];
  const collected: unknown[] = [
    ...(Array.isArray(rolesRaw) ? rolesRaw : []),
    ...(typeof singleRaw === "string" ? [singleRaw] : []),
  ];
  const roles = collected
    .filter((r): r is string => typeof r === "string")
    .map((r) => r.trim().toLowerCase())
    .filter((r) => r.length > 0);
  return {
    id,
    name,
    firmName,
    phone,
    roles,
    tosAcceptedAt: typeof tosRaw === "string" && tosRaw ? tosRaw : null,
  };
}

function normalizeVerifyResult(raw: unknown): VerifyOtpResult {
  const root = (raw !== null && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const inner = root["data"];
  const data =
    inner !== null && typeof inner === "object"
      ? (inner as Record<string, unknown>)
      : root;
  // Server sends { accessToken, refreshToken, user }; accept `token` alias too.
  const token = (data["accessToken"] ?? data["token"] ?? root["accessToken"] ?? root["token"]) as unknown;
  const refreshToken = (data["refreshToken"] ?? root["refreshToken"]) as unknown;
  const user = normalizeUser(data["user"] ?? root["user"]);
  if (typeof token !== "string" || !token) {
    throw new ApiError(
      500,
      "Unexpected server response to OTP verification (missing token).",
    );
  }
  return {
    token,
    ...(typeof refreshToken === "string" && refreshToken ? { refreshToken } : {}),
    user,
  };
}

/* ---------- real backend API ---------- */

export const authApi = {
  async requestOtp(phone: string): Promise<OtpChallenge> {
    const raw = await apiFetch<unknown>(apiUrl(AUTH_ENDPOINTS.requestOtp), {
      method: "POST",
      body: { phone },
    });
    return normalizeChallenge(raw, phone);
  },

  async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const raw = await apiFetch<unknown>(apiUrl(AUTH_ENDPOINTS.verifyOtp), {
      method: "POST",
      // Server contract uses `otp`; app domain type keeps `code`.
      body: { phone: input.phone, otp: input.code },
    });
    return normalizeVerifyResult(raw);
  },
};
