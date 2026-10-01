import { ProfileButton } from "@/components/common/ProfileButton";
import { Button } from "@/components/ui/Button";
import { useSellerHome } from "@/features/seller/home/hooks/useSellerHome";
import type { HomeRow } from "@/features/seller/home/hooks/useSellerHome";
import { priceLabel } from "@/core/utils/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fonts } from "@/theme/typography";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Seller home (`isHome` in Seller App.html): today's listings dashboard. */
export function SellerHomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    firmName,
    rows,
    liveCount,
    pricedCount,
    expired,
    expiryLabel,
    isLoading,
    error,
    retry,
  } = useSellerHome();

  function openListing(row: HomeRow) {
    router.push({
      pathname: "/listing/[id]",
      params: { id: String(row.id) },
    });
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          {firmName ? <Text style={styles.kicker}>{firmName}</Text> : null}
          <Text style={styles.title}>Today&apos;s listings</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.tag, expired ? styles.tagMuted : styles.tagAccent]}>
            <Text style={[styles.tagText, expired ? styles.tagTextMuted : null]}>
              {expiryLabel}
            </Text>
          </View>
          <ProfileButton />
        </View>
      </View>

      {expired ? (
        <View style={styles.expiredCard}>
          <Text style={styles.expiredTitle}>Prices cleared at 2:00 AM</Text>
          <Text style={styles.expiredBody}>
            Yesterday&apos;s listings are kept, just waiting on fresh prices
            for today.
          </Text>
          <Button
            title="Add today's prices"
            onPress={() => router.push("/bulk-edit")}
          />
        </View>
      ) : null}

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statKicker}>Live listings</Text>
          <Text style={styles.statValue}>{liveCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statKicker}>Priced</Text>
          <Text style={styles.statValue}>{pricedCount}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionFlex}>
          <Button title="Scan sheet" onPress={() => router.push("/scan")} />
        </View>
        <View style={styles.actionFlex}>
          <Button
            title="Add listing"
            onPress={() => router.push("/add-listing-form")}
          />
        </View>
        <View style={styles.actionFlex}>
          <Button title="Bulk edit" onPress={() => router.push("/bulk-edit")} />
        </View>
      </View>
      <Button
        title="Browse buyer requirements"
        variant="secondary"
        onPress={() => router.push("/requirements")}
      />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Loading today&apos;s listings…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={retry} />
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map((row) => (
            <Pressable
              key={String(row.id)}
              style={styles.row}
              onPress={() => openListing(row)}
              accessibilityRole="button"
              accessibilityLabel={`${row.item} ${row.price === null ? "no price" : priceLabel(row.price)}`}
            >
              <View style={styles.rowMain}>
                <View style={styles.rowTag}>
                  <Text style={styles.rowTagText}>{row.category}</Text>
                </View>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {row.item}
                </Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {row.weight} bag
                </Text>
              </View>
              <Text style={styles.rowPrice}>
                {row.price === null ? "N/A" : priceLabel(row.price)}
              </Text>
            </Pressable>
          ))}
          {rows.length === 0 ? (
            <Text style={styles.empty}>
              No listings yet — add your first listing for today.
            </Text>
          ) : null}
        </View>
      )}
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    color: colors.muted,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.text,
  },
  tag: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagAccent: {
    backgroundColor: colors.accent2Tint,
  },
  tagMuted: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.accent2Dark,
  },
  tagTextMuted: {
    color: colors.primary,
  },
  expiredCard: {
    gap: spacing.sm,
    backgroundColor: colors.primaryTint,
    borderRadius: 16,
    padding: spacing.md,
    boxShadow: "0 1px 2px rgba(46,43,37,0.14)",
  },
  expiredTitle: {
    fontFamily: fonts.heading,
    fontSize: 16,
    color: colors.primaryDark,
  },
  expiredBody: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: colors.text,
  },
  stats: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    gap: 2,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 13,
    boxShadow: "0 1px 2px rgba(46,43,37,0.14)",
  },
  statKicker: {
    fontFamily: fonts.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.primary,
  },
  statValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 26,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionFlex: {
    flex: 1,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 1px 2px rgba(46,43,37,0.14)",
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.tagSolid,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  rowTagText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11.5,
    color: "#ffffff",
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  rowPrice: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    flexShrink: 0,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  centerText: {
    fontSize: 13,
    color: colors.muted,
  },
  errorText: {
    fontSize: 13.5,
    color: colors.danger,
    textAlign: "center",
  },
  empty: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: spacing.md,
  },
});
