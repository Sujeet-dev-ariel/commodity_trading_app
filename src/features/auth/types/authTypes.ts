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
  /** Version string the user accepted (server is source of truth). */
  tosAcceptedVersion: string | null;
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

/** Current Terms of Service document served by `GET /tos/current`. */
export interface TosVersion {
  version: string;
  title: string | null;
  content: string;
}

/** Acceptance state served by `GET /tos/status`. */
export interface TosStatus {
  accepted: boolean;
  currentVersion: string | null;
  acceptedVersion: string | null;
  acceptedAt: string | null;
}

/** Result of `POST /tos/accept`. */
export interface TosAcceptResult {
  acceptedVersion: string;
  acceptedAt: string | null;
}
