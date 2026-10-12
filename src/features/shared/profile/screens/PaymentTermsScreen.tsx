import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileHeader } from "@/features/shared/profile/components/ProfileHeader";
import { ProfileTabBar } from "@/features/shared/profile/components/ProfileTabBar";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Firm default until the backend serves it (mirrors listing detail). */
const DEFAULT_PAYMENT_TERMS = "10-15 days";

/**
 * Payment terms screen (Profile → Payment terms): the seller's default
 * terms across listings. Local-only until the backend firm-profile
 * contract exists — per-listing overrides already send via listingsApi.
 */
export function PaymentTermsScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [terms, setTerms] = useState(DEFAULT_PAYMENT_TERMS);

  const name = session?.user.firmName || session?.user.name || "Account";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top + spacing.md, 62),
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
      >
        <ProfileHeader initial={name.slice(0, 1).toUpperCase()} />

        <Text style={styles.title}>Payment terms</Text>

        <View style={styles.card}>
          <Text style={styles.helper}>
            Your default terms across listings. Override per listing when
            needed.
          </Text>
          <TextInput
            style={styles.input}
            value={terms}
            onChangeText={setTerms}
            placeholder="e.g. 10-15 days"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Default payment terms"
          />
        </View>
      </ScrollView>
      <ProfileTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
  },
  card: {
    gap: spacing.sm,
    backgroundColor: colors.primaryTint,
    borderRadius: 16,
    padding: spacing.md,
  },
  helper: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
});
