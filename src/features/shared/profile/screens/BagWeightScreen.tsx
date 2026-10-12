import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileHeader } from "@/features/shared/profile/components/ProfileHeader";
import { ProfileTabBar } from "@/features/shared/profile/components/ProfileTabBar";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Fallback until the backend serves the seller's default bag weight. */
const DEFAULT_BAG_WEIGHT = "30 KG";

/**
 * Bag weight screen (Profile → Bag weight): the seller's default weight
 * used when a listing doesn't specify one. Local-only until the backend
 * firm-profile contract exists.
 */
export function BagWeightScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState(DEFAULT_BAG_WEIGHT);

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

        <Text style={styles.title}>Bag weight</Text>

        <View style={styles.card}>
          <Text style={styles.helper}>
            Default weight used when a listing doesn&apos;t specify one.
          </Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="e.g. 30 KG"
            placeholderTextColor={colors.muted}
            accessibilityLabel="Default bag weight"
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
