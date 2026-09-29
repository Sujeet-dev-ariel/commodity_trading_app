import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

interface CategoryChipsProps<T extends string> {
  values: readonly T[];
  value: T;
  onChange: (value: T) => void;
}

/** Horizontal category chips (All + CATEGORIES), ported from both prototypes. */
export function CategoryChips<T extends string>({ values, value, onChange }: CategoryChipsProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {values.map((c) => {
        const active = c === value;
        return (
          <Pressable
            key={c}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(c)}
            accessibilityRole="button"
            accessibilityLabel={c}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.text, active && styles.textActive]}>{c}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    paddingBottom: 4,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  textActive: {
    color: colors.onPrimary,
  },
});
