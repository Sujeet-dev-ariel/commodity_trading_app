import { apiFetch } from "@/core/api/client";
import { USERS_ENDPOINTS, apiUrl } from "@/core/api/endpoints";

/**
 * Own-profile shape served by `GET /users/me` and returned by
 * `PATCH /users/me`. Field names mirror the backend Prisma `AppUser`
 * model (camelCase); the editable subset matches
 * `buildProfileUpdateData` in `services/user.validation.js`
 * (name/firmName/city/firmNotes/defaultPaymentTerms/defaultWeightKg).
 */
export interface MyProfile {
  id: string;
  phone: string;
  name: string | null;
  firmName: string | null;
  roles: string[];
  city: string | null;
  firmNotes: string | null;
  defaultPaymentTerms: number | null;
  defaultWeightKg: number | null;
  status: string | null;
  tosAcceptedVersion: number | null;
  tosAcceptedAt: string | null;
}

/**
 * Editable subset for `PATCH /users/me`. Keys sent as `undefined` are
 * omitted; `null`/empty-string clears a text field server-side, and
 * `null` clears a numeric field. The backend requires numbers (not
 * numeric strings) for the integer fields and rejects an empty patch.
 */
export interface UpdateProfileInput {
  name?: string | null;
  firmName?: string | null;
  city?: string | null;
  firmNotes?: string | null;
  defaultPaymentTerms?: number | null;
  defaultWeightKg?: number | null;
}

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
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function pickInt(data: RawMap, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = data[k];
    if (typeof v === "number" && Number.isInteger(v) && v >= 0) return v;
    if (
      typeof v === "string" &&
      v.trim() !== "" &&
      Number.isInteger(Number(v)) &&
      Number(v) >= 0
    ) {
      return Number(v);
    }
  }
  return null;
}

function normalizeProfile(raw: unknown): MyProfile {
  const data = unwrap(raw);
  const rolesRaw = data["roles"];
  const roles = Array.isArray(rolesRaw)
    ? rolesRaw.filter((r): r is string => typeof r === "string")
    : [];
  const tosRaw = data["tosAcceptedAt"];
  return {
    id: pickString(data, "id", "_id", "userId") ?? "",
    phone: pickString(data, "phone", "phoneNumber", "mobile") ?? "",
    name: pickString(data, "name", "fullName", "displayName"),
    firmName: pickString(data, "firmName", "firm", "companyName"),
    roles,
    city: pickString(data, "city", "town"),
    firmNotes: pickString(data, "firmNotes", "firm_notes"),
    defaultPaymentTerms: pickInt(
      data,
      "defaultPaymentTerms",
      "default_payment_terms",
    ),
    defaultWeightKg: pickInt(data, "defaultWeightKg", "default_weight_kg"),
    status: pickString(data, "status"),
    tosAcceptedVersion: pickInt(data, "tosAcceptedVersion"),
    tosAcceptedAt: typeof tosRaw === "string" && tosRaw ? tosRaw : null,
  };
}

function toPayload(input: UpdateProfileInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) body["name"] = input.name;
  if (input.firmName !== undefined) body["firmName"] = input.firmName;
  if (input.city !== undefined) body["city"] = input.city;
  if (input.firmNotes !== undefined) body["firmNotes"] = input.firmNotes;
  if (input.defaultPaymentTerms !== undefined) {
    body["defaultPaymentTerms"] = input.defaultPaymentTerms;
  }
  if (input.defaultWeightKg !== undefined) {
    body["defaultWeightKg"] = input.defaultWeightKg;
  }
  return body;
}

/* ---------- own-profile API (every call needs the session token) ---------- */

export const profileApi = {
  /** Fetch the caller's own profile. */
  async getMe(token: string): Promise<MyProfile> {
    const raw = await apiFetch<unknown>(apiUrl(USERS_ENDPOINTS.me), { token });
    return normalizeProfile(raw);
  },

  /** Update editable profile fields; returns the updated profile. */
  async updateMe(token: string, input: UpdateProfileInput): Promise<MyProfile> {
    const raw = await apiFetch<unknown>(apiUrl(USERS_ENDPOINTS.me), {
      method: "PATCH",
      body: toPayload(input),
      token,
    });
    return normalizeProfile(raw);
  },
};
