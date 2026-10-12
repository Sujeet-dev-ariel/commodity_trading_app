import { Alert, ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/common/BackButton";
import { ProfileButton } from "@/components/common/ProfileButton";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { getFriendlyApiError } from "@/core/api/client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { requirementsApi } from "@/features/buyer/requirements/api/requirementsApi";
import type { BuyerRequirement } from "@/types/domain";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

/**
 * Buyer's own requirement detail (opened from My requirements): live data
 * via `GET /listings/:id`, seeded from the list row so it renders instantly,
 * plus Withdraw. Back returns to the My requirements list.
 */
export function RequirementDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    category?: string;
    item?: string;
    bags?: string;
    targetPrice?: string;
    paymentTerms?: string;
  }>();
  const { runWithAuth } = useAuth();
  const id = typeof params.id === "string" ? params.id : undefined;

  const [requirement, setRequirement] = useState<BuyerRequirement | null>(() =>
    params.item
      ? {
          id: params.id ?? "",
          category: (params.category || "Rice") as BuyerRequirement["category"],
          item: params.item,
          buyer: "",
          paymentTerms: params.paymentTerms || "",
          targetPrice: Number(params.targetPrice ?? 0) || 0,
          bags: Number(params.bags ?? 0) || 0,
        }
      : null,
  );
  const [isLoading, setIsLoading] = useState(!params.item);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      if (!params.item) setError("Requirement details unavailable.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setRequirement(
        await runWithAuth((token) => requirementsApi.getById(id, token)),
      );
    } catch (e) {
      if (!params.item) {
        setError(getFriendlyApiError(e, "Could not load this requirement"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, params.item, runWithAuth]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function confirmWithdraw() {
    if (!requirement) return;
    Alert.alert(
      "Withdraw requirement?",
      `${requirement.item} will be taken off the market.`,
      [
        { text: "Keep", style: "cancel" },
        {
          text: "Withdraw",
          style: "destructive",
          onPress: () => void doWithdraw(),
        },
      ],
    );
  }

  async function doWithdraw() {
    if (!requirement) return;
    setIsWithdrawing(true);
    setError(null);
    try {
      await runWithAuth((token) =>
        requirementsApi.withdraw(requirement.id, token),
      );
      router.back();
    } catch (e) {
      setError(getFriendlyApiError(e, "Could not withdraw the requirement"));
    } finally {
      setIsWithdrawing(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <View style={styles.topRow}>
        <BackButton
          accessibilityLabel="Back to my requirements"
          fallback="/post-req"
        />
        <ProfileButton />
      </View>

      {isLoading && !requirement ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading requirement…</Text>
        </View>
      ) : error && !requirement ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={load} />
        </View>
      ) : requirement ? (
        <>
          <Text style={styles.title}>{requirement.item}</Text>
          <Text style={styles.subtitle}>{requirement.category}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{requirement.bags} bags</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Target Price</Text>
            <Text style={styles.detailValue}>
              {requirement.targetPrice > 0
                ? `Rs.${requirement.targetPrice.toLocaleString("en-IN")} / bag`
                : "Open to offers"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Terms</Text>
            <Text style={styles.detailValue}>
              {requirement.paymentTerms || "Terms on request"}
            </Text>
          </View>

          {error ? <FormStatus kind="error" message={error} /> : null}

          <View style={styles.buttonWrapper}>
            <Button
              title={isWithdrawing ? "Withdrawing…" : "Withdraw requirement"}
              variant="secondary"
              onPress={confirmWithdraw}
            />
          </View>
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
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: -spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
  center: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  errorText: {
    fontSize: 13.5,
    color: colors.danger,
    textAlign: "center",
  },
});
