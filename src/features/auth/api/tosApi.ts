import { ApiError, apiFetch } from "@/core/api/client";
import { TOS_ENDPOINTS, apiUrl } from "@/core/api/endpoints";
import type {
  TosAcceptResult,
  TosStatus,
  TosVersion,
} from "@/features/auth/types/authTypes";

type RawMap = Record<string, unknown>;

/** Backend sends `{ success: true, data: {...} }`; accept a flat shape too. */
function unwrap(raw: unknown): RawMap {
  const root = (raw !== null && typeof raw === "object" ? raw : {}) as RawMap;
  const inner = root["data"];
  return inner !== null && typeof inner === "object"
    ? (inner as RawMap)
    : root;
}

function pickString(data: RawMap, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

function pickBool(data: RawMap, ...keys: string[]): boolean | null {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "boolean") return v;
    if (v === 1 || v === "true") return true;
    if (v === 0 || v === "false") return false;
  }
  return null;
}

function normalizeVersion(raw: unknown): TosVersion {
  const data = unwrap(raw);
  const version = pickString(data, "version", "versionId", "v", "tosVersion");
  if (!version) {
    throw new ApiError(
      500,
      "Unexpected server response for terms (missing version).",
    );
  }
  return {
    version,
    title: pickString(data, "title", "name", "heading"),
    content:
      pickString(
        data,
        "content",
        "text",
        "body",
        "tosText",
        "terms",
        "description",
      ) ?? "",
  };
}

function normalizeStatus(raw: unknown): TosStatus {
  const data = unwrap(raw);
  const accepted = pickBool(data, "accepted", "hasAccepted", "isAccepted") ?? false;
  return {
    accepted,
    currentVersion: pickString(
      data,
      "currentVersion",
      "latestVersion",
      "version",
      "tosVersion",
    ),
    acceptedVersion: pickString(
      data,
      "acceptedVersion",
      "termsAcceptedVersion",
      "acceptedTosVersion",
    ),
    acceptedAt: pickString(data, "acceptedAt", "tosAcceptedAt", "termsAcceptedAt"),
  };
}

function normalizeAccept(raw: unknown, fallbackVersion: string): TosAcceptResult {
  const data = unwrap(raw);
  return {
    acceptedVersion:
      pickString(
        data,
        "acceptedVersion",
        "version",
        "currentVersion",
        "tosVersion",
      ) ?? fallbackVersion,
    acceptedAt: pickString(data, "acceptedAt", "tosAcceptedAt", "termsAcceptedAt"),
  };
}

/* ---------- versioned Terms of Service API ---------- */

export const tosApi = {
  /** Fetch the current TOS document shown after OTP on first login. */
  async current(token: string): Promise<TosVersion> {
    const raw = await apiFetch<unknown>(apiUrl(TOS_ENDPOINTS.current), { token });
    return normalizeVersion(raw);
  },

  /** Check whether the user accepted the current version (skips terms when true). */
  async status(token: string): Promise<TosStatus> {
    const raw = await apiFetch<unknown>(apiUrl(TOS_ENDPOINTS.status), { token });
    return normalizeStatus(raw);
  },

  /** Record acceptance of the given version. */
  async accept(version: string, token: string): Promise<TosAcceptResult> {
    const raw = await apiFetch<unknown>(apiUrl(TOS_ENDPOINTS.accept), {
      method: "POST",
      body: { version },
      token,
    });
    return normalizeAccept(raw, version);
  },
};
