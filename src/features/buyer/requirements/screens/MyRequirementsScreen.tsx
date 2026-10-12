import { Alert, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ProfileButton } from "@/components/common/ProfileButton";
import { Button } from "@/components/ui/Button";
import { useMyRequirements } from "@/features/buyer/requirements/hooks/useMyRequirements";
import type { BuyerRequirement } from "@/types/domain";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { fonts } from "@/theme/typography";

/**
 * Buyer "My requirements" (the Post req tab root): the buyer's own posted
 * BUY requirements with a "Post requirement" button that opens the form —
 * the mirror of the seller's Today's-listings dashboard + add-listing form.
 */
export function MyRequirementsScreen() {
  const insets = useSafeAreaInsets();
  const { items, count, isLoading, error, retry, withdraw, withdrawingId } =
    useMyRequirements();

  function openForm() {
    router.push("/post-req/new");
  }

  function openDetail(req: BuyerRequirement) {
    router.push({
      pathname: "/post-req/[id]",
      params: {
        id: String(req.id),
        category: req.category,
        item: req.item,
        bags: String(req.bags),
        targetPrice: String(req.targetPrice),
        paymentTerms: req.paymentTerms,
      },
    });
  }

  function confirmWithdraw(req: BuyerRequirement) {
    Alert.alert(
      "Withdraw requirement?",
      `${req.item} — ${req.bags} bags will be taken off the market.`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => {
            void withdraw(req.id);
          },
        },
      ],
    );
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
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            My requirements
          </Text>
          <Text style={styles.subtitle}>
            {count === 0 ? "Nothing posted yet" : `${count} posted`}
          </Text>
        </View>
        <ProfileButton />
      </View>

      <Button title="Post requirement" onPress={openForm} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Loading your requirements…</Text>
        </View>
      ) : error && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={retry} />
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((req) => {
            const busy = withdrawingId === String(req.id);
            return (
              <Pressable
                key={String(req.id)}
                style={styles.row}
                onPress={() => openDetail(req)}
                accessibilityRole="button"
                accessibilityLabel={`${req.item}, ${req.bags} bags`}
              >
                <View style={styles.rowMain}>
                  <View style={styles.rowTag}>
                    <Text style={styles.rowTagText}>{req.category}</Text>
                  </View>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {req.item}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {req.bags} bags ·{" "}
                    {req.targetPrice > 0
                      ? `target Rs.${req.targetPrice.toLocaleString("en-IN")}`
                      : "open to offers"}
                  </Text>
                </View>
                <Pressable
                  hitSlop={8}
                  disabled={busy}
                  onPress={() => confirmWithdraw(req)}
                  accessibilityRole="button"
                  accessibilityLabel={`Withdraw ${req.item}`}
                >
                  <Text style={[styles.withdraw, busy ? styles.withdrawBusy : null]}>
                    {busy ? "…" : "Withdraw"}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
          {items.length === 0 ? (
            <Text style={styles.empty}>
              No requirements yet — post your first requirement for sellers to
              see.
            </Text>
          ) : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 20,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.muted,
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
  withdraw: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.danger,
    flexShrink: 0,
  },
  withdrawBusy: {
    opacity: 0.5,
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
