import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { homePath, resolveBackendRole } from "@/core/auth/roleStore";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Entry point: login → terms → role Browse (backend `user.roles` decides).
 * Thin route — all UI lives in feature screens.
 */
export default function Index() {
  const { session, status, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (status === "signed-out") return <Redirect href="/login" />;
  if (status === "needs-terms") return <Redirect href="/terms" />;
  return <Redirect href={homePath(resolveBackendRole(session?.user))} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
