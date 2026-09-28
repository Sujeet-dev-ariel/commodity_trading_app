import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ title, onPress, loading, disabled, variant = "primary" }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : null,
        variant === "secondary" ? styles.secondary : null,
        variant === "ghost" ? styles.ghost : null,
        (pressed || isDisabled) && styles.dimmed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onPrimary : colors.primary} />
      ) : (
        <Text
          style={
            variant === "primary"
              ? styles.primaryText
              : variant === "secondary"
                ? styles.secondaryText
                : styles.ghostText
          }
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  dimmed: {
    opacity: 0.6,
  },
  primaryText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
  ghostText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
