import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Placeholder legal copy (Buyer App.html `tosText`) — replace with final copy. */
const TOS_TEXT =
  "This is placeholder Terms of Service text for design review — final legal copy to follow. It covers acceptable use of the KKPK app, buyer and seller responsibilities on the platform, payment and settlement terms between parties, dispute handling, data use, and account suspension. Please read the full Terms of Service and Privacy Policy before continuing.";

/** Terms acceptance gate (Buyer App.html `isTos`). Shown after OTP, before home. */
export function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { acceptTerms } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAgree() {
    setError(null);
    setIsLoading(true);
    try {
      await acceptTerms();
      router.replace("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save acceptance");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.safe}>
      <View
        style={[
          styles.content,
          { paddingTop: insets.top, paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.tag}>
          <Text style={styles.tagText}>TERMS OF SERVICE</Text>
        </View>
        <Text style={styles.title}>Terms of Service &amp; Privacy Policy</Text>
        <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
          <Text style={styles.body}>{TOS_TEXT}</Text>
        </ScrollView>
        <View style={styles.links}>
          <Text style={styles.link}>Terms of Service</Text>
          <Text style={styles.link}>Privacy Policy</Text>
        </View>
        <Text style={styles.note}>
          By continuing, you agree to the Terms of Service and Privacy Policy.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={styles.btn} onPress={handleAgree} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.btnText}>Agree &amp; Continue</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: 20,
    gap: 14,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: colors.tagBuyerBg,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    letterSpacing: 0.2,
    color: colors.tagBuyerText,
    fontWeight: "700",
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
  },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  cardContent: {
    padding: spacing.md,
  },
  body: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.text,
    opacity: 0.85,
  },
  links: {
    flexDirection: "row",
    gap: spacing.md,
  },
  link: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accentBlue,
  },
  note: {
    fontSize: 12,
    color: colors.prototypeMuted,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    textAlign: "center",
  },
  btn: {
    height: 46,
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.accentBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onPrimary,
  },
});
