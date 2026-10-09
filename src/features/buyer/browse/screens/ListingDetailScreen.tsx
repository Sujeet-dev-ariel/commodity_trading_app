import { ProfileButton } from "@/components/common/ProfileButton";
import { BackButton } from "@/components/common/BackButton";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { useListingDetail } from "@/features/buyer/browse/hooks/useListingDetail";
import { priceLabel } from "@/core/utils/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Firm defaults ported from Buyer App.html (static until backend serves them). */
const FIRM_PAYMENT_DEFAULT = "10-15 days";
const FIRM_TERMS =
  "Goods must be outward within two days of order confirmation. Program received only before 5:00 PM. No tempo loading after 10 PM. Prices are subject to market conditions.";

/**
 * Buyer listing detail (Buyer App.html detail screen): tapped from Browse —
 * price card, payment terms, Make an offer / Buy, firm terms, and
 * view-all-from-seller. Offer/buy submit needs a backend trade contract.
 */
export function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    category?: string;
    item?: string;
    quality?: string;
    weight?: string;
    seller?: string;
    price?: string;
  }>();
  const { listing, isLoading, error, retry } = useListingDetail({
    id: typeof params.id === "string" ? params.id : undefined,
    category: params.category,
    item: params.item,
    quality: params.quality,
    weight: params.weight,
    seller: params.seller,
    price: params.price,
  });
  const [notice, setNotice] = useState<string | null>(null);

  function viewAllFromSeller() {
    if (!listing) return;
    router.push({
      pathname: "/browse",
      params: { seller: listing.seller },
    });
  }

  function pendingTrade(action: string) {
    setNotice(
      `${action} arrives with the backend trade API — nothing is booked yet.`,
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.topRow}>
        <BackButton accessibilityLabel="Back to browse" fallback="/browse" />
        <ProfileButton />
      </View>

      {isLoading && !listing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading listing…</Text>
        </View>
      ) : error && !listing ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={retry} />
        </View>
      ) : listing ? (
        <>
          <View>
            <View style={styles.tagRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{listing.category}</Text>
              </View>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{listing.item}</Text>
              {listing.quality ? (
                <View style={styles.qualityChip}>
                  <Text style={styles.qualityChipText}>{listing.quality}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.muted}>
              {listing.weight} per bag · sold by {listing.seller}
            </Text>
          </View>

          <View style={styles.priceCard}>
            <Text style={styles.kicker}>Price per bag</Text>
            <Text style={styles.price}>{priceLabel(listing.price)}</Text>
            <View style={styles.validTag}>
              <Text style={styles.validTagText}>Valid until 2:00 AM</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.kicker}>Payment terms</Text>
            <Text style={styles.body}>{FIRM_PAYMENT_DEFAULT}</Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionFlex}>
              <Button
                title="Make an offer"
                onPress={() => pendingTrade("Making an offer")}
              />
            </View>
            <View style={styles.actionFlex}>
              <Button title="Buy" onPress={() => pendingTrade("Buying")} />
            </View>
          </View>
          {notice ? <FormStatus kind="info" message={notice} /> : null}

          <View style={styles.card}>
            <Text style={styles.kicker}>Terms of Service</Text>
            <Text style={styles.body}>{FIRM_TERMS}</Text>
          </View>

          <Button
            title={`View all listings from ${listing.seller}`}
            variant="secondary"
            onPress={viewAllFromSeller}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagRow: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  qualityChip: {
    backgroundColor: colors.primaryTint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qualityChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  priceCard: {
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  kicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.muted,
  },
  price: {
    fontSize: 34,
    fontWeight: "800",
    color: colors.text,
  },
  validTag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  validTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
  },
  card: {
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  body: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.text,
    opacity: 0.85,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  errorText: {
    fontSize: 13.5,
    color: colors.danger,
    textAlign: "center",
  },
});
