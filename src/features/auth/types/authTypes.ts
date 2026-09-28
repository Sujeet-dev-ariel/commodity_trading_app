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
