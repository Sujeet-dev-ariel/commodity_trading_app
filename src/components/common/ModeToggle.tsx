import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

interface ModeToggleProps {
  first: string;
  second: string;
  value: "first" | "second";
  onChange: (value: "first" | "second") => void;
}

/**
 * Segmented By Commodity / By Seller (buyer) and By Commodity / By Buyer
 * (seller) switch, ported from both prototypes (same control, labels differ).
 */
export function ModeToggle({ first, second, value, onChange }: ModeToggleProps) {
  const options = [
    { key: "first" as const, label: first },
    { key: "second" as const, label: second },
  ];
  return (
    <View style={styles.wrap}>
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            style={[styles.option, active && styles.optionActive]}
            onPress={() => onChange(key)}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: colors.searchBg,
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  option: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: colors.card,
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  labelActive: {
    color: colors.primaryDark,
  },
});
