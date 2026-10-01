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
  }
  return null;
}

/**
 * TOS versions are integers (`POST /tos/accept` rejects `"2"` with
 * `version must be an integer`). Accepts a number or numeric string.
 */
function pickInt(data: RawMap, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "number" && Number.isInteger(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && Number.isInteger(Number(v))) {
      return Number(v);
    }
    // `currentVersion` may arrive as an object like `{ version: 2, ... }`.
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      const nested = pickInt(
        v as RawMap,
        "version",
        "versionId",
        "v",
        "tosVersion",
      );
      if (nested !== null) return nested;
    }
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
  const version = pickInt(data, "version", "versionId", "v", "tosVersion");
  if (version === null) {
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
  const currentVersion = pickInt(
    data,
    "currentVersion",
    "latestVersion",
    "version",
    "tosVersion",
  );
  const acceptedVersion = pickInt(
    data,
    "acceptedVersion",
    "termsAcceptedVersion",
    "acceptedTosVersion",
  );
  const acceptedAt = pickString(
    data,
    "acceptedAt",
    "tosAcceptedAt",
    "termsAcceptedAt",
  );
  // Newer servers send `needsAcceptance`; older ones send `accepted`.
  // When neither is present, compare accepted vs current version numbers.
  const explicit = pickBool(data, "accepted", "hasAccepted", "isAccepted");
  const needsAcceptance = pickBool(
    data,
    "needsAcceptance",
    "needs_acceptance",
    "requiresAcceptance",
  );
  const accepted =
    explicit ??
    (needsAcceptance !== null
      ? !needsAcceptance
      : acceptedVersion !== null &&
        (currentVersion === null || acceptedVersion >= currentVersion));
  return { accepted, currentVersion, acceptedVersion, acceptedAt };
}

function normalizeAccept(raw: unknown, fallbackVersion: number): TosAcceptResult {
  const data = unwrap(raw);
  return {
    acceptedVersion:
      pickInt(
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

  /** Record acceptance of the given version (server requires an integer). */
  async accept(version: number, token: string): Promise<TosAcceptResult> {
    const raw = await apiFetch<unknown>(apiUrl(TOS_ENDPOINTS.accept), {
      method: "POST",
      body: { version },
      token,
    });
    return normalizeAccept(raw, version);
  },
};
