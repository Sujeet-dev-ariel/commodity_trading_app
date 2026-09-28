import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/features/auth/hooks/useAuth";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(buyer)" />
          <Stack.Screen name="(seller)" />
          <Stack.Screen name="(shared)" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
