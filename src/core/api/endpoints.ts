import { ENV } from "@/core/config/env";

export const AUTH_ENDPOINTS = {
  requestOtp: "/auth/login",
  verifyOtp: "/auth/verify-otp",
} as const;

export const TOS_ENDPOINTS = {
  current: "/tos-versions/current",
  accept: "/tos/accept",
  status: "/tos/status",
} as const;

export const LISTINGS_ENDPOINTS = {
  create: "/listings",
  bulkPrice: "/listings/bulk-price",
  template: "/listings/template",
  bulkUpload: "/listings/bulk-upload",
  bulkConfirm: "/listings/bulk-confirm",
  list: (side: "BUY" | "SELL") => `/listings?side=${side}`,
  byId: (id: string) => `/listings/${id}`,
  withdraw: (id: string) => `/listings/${id}/withdraw`,
} as const;

export const COMMODITY_CATEGORIES_ENDPOINTS = {
  list: "/commodity-categories",
} as const;

export const COMMODITIES_ENDPOINTS = {
  list: (categoryId?: string) =>
    categoryId ? `/commodities?categoryId=${categoryId}` : "/commodities",
} as const;

export function apiUrl(path: string): string {
  return `${ENV.apiUrl}${path}`;
}
