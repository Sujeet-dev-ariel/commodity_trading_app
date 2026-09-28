import type { User } from "@/features/auth/types/authTypes";
import type { Role } from "@/types/domain";

/**
 * Backend-driven role: exactly one of buyer/seller in `user.roles`
 * decides the workspace. Ambiguous accounts (both or neither) fall back
 * to the buyer home.
 */
export function resolveBackendRole(user: Pick<User, "roles"> | null | undefined): Role | null {
  const roles = (user?.roles ?? []).map((r) =>
    typeof r === "string" ? r.trim().toLowerCase() : "",
  );
  const isBuyer = roles.includes("buyer");
  const isSeller = roles.includes("seller");
  if (isSeller && !isBuyer) return "seller";
  if (isBuyer && !isSeller) return "buyer";
  return null;
}

/** Workspace for a role (ambiguous roles default to the buyer home). */
export function homePath(role: Role | null): "/home" | "/dashboard" {
  return role === "seller" ? "/dashboard" : "/home";
}
