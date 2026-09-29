import { ENV } from "@/core/config/env";

export const AUTH_ENDPOINTS = {
  requestOtp: "/auth/login",
  verifyOtp: "/auth/verify-otp",
} as const;

export const TOS_ENDPOINTS = {
  current: "/tos/current",
  accept: "/tos/accept",
  status: "/tos/status",
} as const;

export function apiUrl(path: string): string {
  return `${ENV.apiUrl}${path}`;
}
