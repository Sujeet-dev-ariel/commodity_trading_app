import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Keeps fully signed-in users out of the auth flow. */
export default function AuthLayout() {
  const { status, isLoading } = useAuth();

  if (!isLoading && status === "signed-in") return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
