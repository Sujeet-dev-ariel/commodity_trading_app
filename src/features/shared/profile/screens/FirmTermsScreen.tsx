import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileHeader } from "@/features/shared/profile/components/ProfileHeader";
import { ProfileTabBar } from "@/features/shared/profile/components/ProfileTabBar";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Firm Terms of Service (Profile → Firm terms): the seller's own terms
 * shown to buyers on listings. Local-only until the backend firm-profile
 * contract exists — saved terms lock (they can only be added once).
 */
export function FirmTermsScreen() {
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const [terms, setTerms] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const name = session?.user.firmName || session?.user.name || "Account";

  function handleAdd() {
    if (!terms.trim()) {
      setError("Write your terms first.");
      return;
    }
    setError(null);
    setSaved(terms.trim());
  }

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

        <Text style={styles.title}>Terms of Service</Text>

        <View style={styles.card}>
          <Text style={styles.helper}>
            Add your Terms of Service. Shown to buyers on your listings. This
            can only be added once.
          </Text>
          {saved ? (
            <FormStatus
              kind="success"
              title="Terms added"
              message="Buyers will see these on your listings."
            />
          ) : null}
          <TextInput
            style={[styles.input, styles.multiline]}
            value={saved ?? terms}
            onChangeText={(v) => {
              setTerms(v);
              setError(null);
            }}
            placeholder="enter your Terms of Service..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!saved}
            accessibilityLabel="Firm Terms of Service"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {saved ? null : (
            <Button title="Add Terms of Service" onPress={handleAdd} />
          )}
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
  multiline: {
    minHeight: 120,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
  },
});
