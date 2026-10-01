import { Button } from "@/components/ui/Button";
import { priceLabel } from "@/core/utils/format";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ParsedRow {
  id: number;
  category: string;
  item: string;
  weight: string;
  price: string;
  featured: boolean;
}

/** Static sample rows (Seller App.html `INITIAL_PARSED_ROWS` — no backend). */
const INITIAL_PARSED_ROWS: ParsedRow[] = [
  { id: 101, category: "Rajma", item: "Black", weight: "30KG", price: "12200", featured: false },
  { id: 102, category: "Dal", item: "Moong", weight: "30KG", price: "8100", featured: true },
  { id: 103, category: "Dal", item: "Dal Chana", weight: "30KG", price: "11800", featured: false },
  { id: 104, category: "Dal", item: "Dal Chana", weight: "30KG", price: "9450", featured: false },
  { id: 105, category: "Besan", item: "Besan", weight: "35KG", price: "2630", featured: false },
];

/**
 * Seller scan flow (`isScan` + `isReview` in Seller App.html).
 * Static: photo parsing has no backend, so the sheet is simulated and the
 * review step edits + publishes the sample rows locally.
 */
export function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<"scan" | "review">("scan");
  const [isUploading, setIsUploading] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>(INITIAL_PARSED_ROWS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function startScan() {
    if (isUploading) return;
    setIsUploading(true);
    uploadTimer.current = setTimeout(() => {
      setIsUploading(false);
      setStep("review");
    }, 900);
  }

  function publish() {
    if (uploadTimer.current) clearTimeout(uploadTimer.current);
    router.replace("/add-listing");
  }

  if (step === "review") {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => setStep("scan")}
          accessibilityRole="button"
          accessibilityLabel="Back to scan"
          style={styles.backButton}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Review {rows.length} rows</Text>
        <Text style={styles.subtitle}>
          Tap a price to fix it. Nothing goes live until you publish.
        </Text>

        <View style={styles.discussionCard}>
          <View style={styles.discussionTag}>
            <Text style={styles.discussionTagText}>FOR DISCUSSION</Text>
          </View>
          <Text style={styles.body}>
            Rows highlighted here match rows marked yellow on the real sheet.
            We don&apos;t yet know what yellow means — featured? changed
            today? Ask before this becomes a real flag.
          </Text>
        </View>

        <View style={styles.list}>
          {rows.map((row) => {
            const editing = editingId === row.id;
            const numeric = Number(row.price);
            return (
              <View
                key={row.id}
                style={[styles.row, row.featured && styles.rowFeatured]}
              >
                <View style={styles.rowMain}>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{row.category}</Text>
                    </View>
                    {row.featured ? (
                      <View style={styles.outlineTag}>
                        <Text style={styles.outlineTagText}>
                          yellow on sheet
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.rowTitle}>{row.item}</Text>
                  <Text style={styles.muted}>{row.weight} bag</Text>
                </View>
                {editing ? (
                  <TextInput
                    style={styles.priceInput}
                    keyboardType="numeric"
                    autoFocus
                    value={row.price}
                    onChangeText={(value) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id ? { ...r, price: value } : r,
                        ),
                      )
                    }
                    onBlur={() => setEditingId(null)}
                    onSubmitEditing={() => setEditingId(null)}
                  />
                ) : (
                  <Pressable
                    onPress={() => setEditingId(row.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit price for ${row.item}`}
                  >
                    <Text style={styles.priceLink}>
                      {Number.isFinite(numeric) && row.price.trim() !== ""
                        ? priceLabel(numeric)
                        : "N/A"}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Button
          title={`Publish ${rows.length} listings`}
          onPress={publish}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backButton}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <Text style={styles.title}>Scan price sheet</Text>
      <Text style={styles.subtitle}>
        Upload a photo of today&apos;s sheet. We&apos;ll pull out the rows for
        you to check.
      </Text>

      <View style={styles.dropBox}>
        <View style={styles.dropIcon}>
          <Text style={styles.dropIconText}>▢</Text>
        </View>
        <Text style={styles.dropTitle}>Drop a photo or tap to upload</Text>
        <Text style={styles.muted}>JPG or PNG · one page of the price list</Text>
      </View>

      <Button
        title={isUploading ? "Parsing…" : "Upload and Parse"}
        disabled={isUploading}
        onPress={startScan}
      />
      <Text style={styles.muted}>
        Reference — a sheet like this one. Parsing runs on-device in this
        preview; nothing is uploaded.
      </Text>
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
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: -spacing.sm,
  },
  muted: {
    fontSize: 12.5,
    color: colors.muted,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
    opacity: 0.85,
  },
  dropBox: {
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  dropIcon: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  dropIconText: {
    fontSize: 22,
    color: colors.primaryDark,
  },
  dropTitle: {
    fontSize: 14,
    color: colors.text,
    textAlign: "center",
  },
  discussionCard: {
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: spacing.md,
  },
  discussionTag: {
    alignSelf: "flex-start",
    backgroundColor: colors.primaryTint,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  discussionTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  list: {
    gap: spacing.sm,
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
  rowFeatured: {
    backgroundColor: colors.primaryTint,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tag: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  outlineTag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  outlineTagText: {
    fontSize: 11.5,
    color: colors.muted,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  priceLink: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    textDecorationLine: "underline",
    textDecorationStyle: "dotted",
  },
  priceInput: {
    width: 84,
    textAlign: "right",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    backgroundColor: colors.background,
  },
});
