import { Redirect, Stack } from "expo-router";
import { resolveBackendRole } from "@/core/auth/roleStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Seller area guard: signed-in sellers only (buyers go to their Browse). */
export default function SellerLayout() {
  const { session, status, isLoading } = useAuth();

  if (isLoading) return null;
  if (status === "signed-out" || status === "needs-terms") return <Redirect href="/" />;
  if (resolveBackendRole(session?.user) !== "seller") return <Redirect href="/browse" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
