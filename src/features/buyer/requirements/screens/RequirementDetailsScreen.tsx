import { Button } from "@/components/ui/Button";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function RequirementDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    category?: string;
    item?: string;
    buyer?: string;
    bags?: string;
    targetPrice?: string;
    paymentTerms?: string;
  }>();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
    >
      <Text style={styles.title}>{params.item || "Requirement"}</Text>
      <Text style={styles.subtitle}>{params.buyer}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Category</Text>
        <Text style={styles.detailValue}>{params.category}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Quantity</Text>
        <Text style={styles.detailValue}>{params.bags} bags</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Target Price</Text>
        <Text style={styles.detailValue}>₹{params.targetPrice} / bag</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Payment Terms</Text>
        <Text style={styles.detailValue}>
          {params.paymentTerms || "Terms on request"}
        </Text>
      </View>

      <View style={styles.buttonWrapper}>
        <Button title="Negotiate" onPress={() => {}} />
      </View>
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
});