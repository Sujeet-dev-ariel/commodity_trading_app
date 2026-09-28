import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ProfileRow as Row } from "@/features/shared/profile/hooks/useProfile";
import { colors } from "@/theme/colors";

interface ProfileRowProps {
  row: Row;
  last: boolean;
  onPress: (row: Row) => void;
}

/** Chevron row inside a grouped profile card (both prototypes). */
export function ProfileRow({ row, last, onPress }: ProfileRowProps) {
  return (
    <Pressable
      style={[styles.row, !last && styles.divider]}
      onPress={() => onPress(row)}
      disabled={row.disabled}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      <Text style={[styles.label, row.disabled && styles.disabled]}>{row.label}</Text>
      <View style={styles.right}>
        {row.tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{row.tag}</Text>
          </View>
        ) : null}
        {!row.disabled ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  disabled: {
    opacity: 0.55,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.muted,
  },
  chevron: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.muted,
    lineHeight: 20,
  },
});
