import { Redirect, Stack } from "expo-router";
import { resolveBackendRole } from "@/core/auth/roleStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Buyer area guard: signed-in buyers only (sellers go to their home). */
export default function BuyerLayout() {
  const { session, status, isLoading } = useAuth();

  if (isLoading) return null;
  if (status === "signed-out" || status === "needs-terms") return <Redirect href="/" />;
  if (resolveBackendRole(session?.user) === "seller") return <Redirect href="/dashboard" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
