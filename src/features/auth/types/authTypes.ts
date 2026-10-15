export interface User {
  id: string;
  name: string;
  firmName: string;
  /** E.164, e.g. `+919910022334`. */
  phone: string;
  /** Backend roles, e.g. `["buyer"]` / `["seller"]` — decides the workspace. */
  roles: string[];
  /** Null until the user accepts the Terms of Service. */
  tosAcceptedAt: string | null;
  /** Version number the user accepted (server is source of truth, integer). */
  tosAcceptedVersion: number | null;
  /** Editable via PATCH /users/me — null until set. */
  city: string | null;
  /** Firm-level logistics/terms notes, PATCH /users/me. */
  firmNotes: string | null;
  /** Default payment terms in days, PATCH /users/me. */
  defaultPaymentTerms: number | null;
  /** Default bag weight in kg, PATCH /users/me. */
  defaultWeightKg: number | null;
  /** Account standing, e.g. `active` — server-managed, read-only. */
  status: string | null;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
  user: User;
}

export interface VerifyOtpInput {
  phone: string;
  code: string;
}

export interface VerifyOtpResult {
  token: string;
  refreshToken?: string;
  user: User;
}

/**
 * Current Terms of Service version served by `GET /tos-versions/current`.
 * Backend-exact (`tosVersion.service`): the document lives at `termsUrl` /
 * `privacyUrl` — there is no inline title/content body.
 */
export interface TosVersion {
  /** Integer version, e.g. `2` — `POST /tos/accept` requires an integer. */
  version: number;
  termsUrl: string | null;
  privacyUrl: string | null;
  effectiveDate: string | null;
}

/** Acceptance state served by `GET /tos/status`. */
export interface TosStatus {
  accepted: boolean;
  currentVersion: number | null;
  acceptedVersion: number | null;
  acceptedAt: string | null;
}

/** Result of `POST /tos/accept`. */
export interface TosAcceptResult {
  acceptedVersion: number;
  acceptedAt: string | null;
}
