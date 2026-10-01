import { Button } from "@/components/ui/Button";
import { useBulkEdit } from "@/features/seller/listings/hooks/useBulkEdit";
import { priceLabel } from "@/core/utils/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Seller bulk price edit (`isBulk` in Seller App.html): checkbox rows,
 * −50/+50/custom deltas, saved via `PATCH /listings/bulk-price`.
 */
export function BulkEditScreen() {
  const insets = useSafeAreaInsets();
  const {
    rows,
    selected,
    selectedCount,
    bulkAmount,
    setBulkAmount,
    toggleSelect,
    selectAll,
    clear,
    applyDelta,
    applyTypedAmount,
    isLoading,
    isSaving,
    error,
    saveError,
    retry,
  } = useBulkEdit();

  return (
    <View style={[styles.safe, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.head}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Bulk edit prices</Text>
        <View style={styles.selectRow}>
          <View style={styles.selectButtons}>
            <View style={styles.selectFlex}>
              <Button
                title="Select all"
                variant="secondary"
                onPress={selectAll}
              />
            </View>
            <View style={styles.selectFlex}>
              <Button title="Clear" variant="secondary" onPress={clear} />
            </View>
          </View>
          <Text style={styles.muted}>{selectedCount} selected</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.muted}>Loading listings…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={retry} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {rows.map((row) => {
            const disabled = row.price === null;
            const isSelected = selected.includes(row.id);
            return (
              <Pressable
                key={row.id}
                style={[styles.row, disabled && styles.rowDisabled]}
                onPress={() => toggleSelect(row.id)}
                disabled={disabled}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected, disabled }}
                accessibilityLabel={`${row.item} ${row.price === null ? "no price" : priceLabel(row.price)}`}
              >
                <View
                  style={[styles.box, isSelected && styles.boxChecked]}
                >
                  {isSelected ? <Text style={styles.check}>✓</Text> : null}
                </View>
                <View style={styles.rowMain}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {row.item}
                  </Text>
                  <Text style={styles.muted} numberOfLines={1}>
                    {row.category} · {row.weight}
                  </Text>
                </View>
                <Text style={styles.rowPrice}>
                  {row.price === null ? "N/A" : priceLabel(row.price)}
                </Text>
              </Pressable>
            );
          })}
          <Text style={styles.note}>
            N/A rows are skipped automatically.
          </Text>
        </ScrollView>
      )}

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        <View style={styles.deltaRow}>
          <View style={styles.selectFlex}>
            <Button
              title="− 50"
              variant="secondary"
              disabled={selectedCount === 0 || isSaving}
              loading={false}
              onPress={() => applyDelta(-50)}
            />
          </View>
          <View style={styles.selectFlex}>
            <Button
              title="+ 50"
              variant="secondary"
              disabled={selectedCount === 0 || isSaving}
              onPress={() => applyDelta(50)}
            />
          </View>
        </View>
        <View style={styles.deltaRow}>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="Custom amount, e.g. -25"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={bulkAmount}
            onChangeText={setBulkAmount}
          />
          <View style={styles.applyButton}>
            <Button
              title={isSaving ? "Saving…" : "Apply"}
              disabled={selectedCount === 0 || isSaving}
              onPress={applyTypedAmount}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  head: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  selectButtons: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
  },
  selectFlex: {
    flex: 1,
  },
  muted: {
    fontSize: 12,
    color: colors.muted,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    textAlign: "center",
  },
  list: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  boxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  check: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.onPrimary,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  rowPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    flexShrink: 0,
  },
  note: {
    fontSize: 12.5,
    color: colors.muted,
    textAlign: "center",
    paddingVertical: 4,
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  deltaRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  amountInput: {
    flex: 1,
  },
  applyButton: {
    minWidth: 110,
  },
});
