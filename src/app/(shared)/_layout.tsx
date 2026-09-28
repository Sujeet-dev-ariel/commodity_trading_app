import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Shared screens (profile, settings…) require a signed-in user. */
export default function SharedLayout() {
  const { status, isLoading } = useAuth();

  if (isLoading) return null;
  if (status === "signed-out" || status === "needs-terms") return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
