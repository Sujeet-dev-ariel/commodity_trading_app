import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** eBay-style sign-in (`isLoginPhone` in Buyer App.html). */
export function LoginScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.xl,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <BrandLogo />
          <Text style={styles.title}>Hello. Sign in to continue.</Text>
          <Text style={styles.subtitle}>
            See today&apos;s prices from all sellers.
          </Text>
        </View>
        <LoginForm
          onCodeSent={(phone, expiresInSec) =>
            router.push({
              pathname: "/verify-otp",
              params: {
                phone,
                ...(expiresInSec !== undefined
                  ? { expiresInSec: String(expiresInSec) }
                  : {}),
              },
            })
          }
        />
        <View style={styles.footer}>
          <Text style={styles.invite}>
            Only invited buyers/sellers can sign in. Contact your broker for access.
          </Text>
          <View style={styles.links}>
            <Text style={styles.link}>Terms</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.link}>Privacy</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.link}>Help</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 20,
  },
  hero: {
    marginTop: spacing.xl,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.prototypeMuted,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    alignItems: "center",
    gap: spacing.sm,
  },
  invite: {
    fontSize: 12.5,
    color: colors.prototypeMuted,
    textAlign: "center",
  },
  links: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  link: {
    fontSize: 12.5,
    fontWeight: "600",
    color: colors.primary,
  },
  dot: {
    fontSize: 12.5,
    color: colors.muted,
  },
});
