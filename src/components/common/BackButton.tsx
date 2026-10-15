import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

interface BackButtonProps {
  /** Screen-reader label, e.g. "Back to dashboard". Defaults to "Back". */
  accessibilityLabel?: string;
  /** Visible text next to the arrow. Defaults to "Back". */
  title?: string;
  /** Where to go when opened via deep link with no history to pop. */
  fallback?: Parameters<typeof router.replace>[0];
  /** Custom handler for multi-step flows (e.g. back to scan step). */
  onPress?: () => void;
}

/**
 * Shared back button: pops the navigation stack, falling back to `fallback`
 * when there is no history (deep link).
 *
 * Designed for older business users: oversized bold arrow + label with a
 * 48px+ touch target, no decorative shapes.
 */
export function BackButton({
  accessibilityLabel = "Back",
  title = "Back",
  fallback,
  onPress,
}: BackButtonProps) {
  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    if (fallback) {
      router.replace(fallback);
      return;
    }
    router.back();
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
    >
      <Text style={styles.backText}>
        <Text style={styles.arrow}>← </Text>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 4,
    paddingRight: 16,
  },
  pressed: {
    opacity: 0.55,
  },
  arrow: {
    fontSize: 24,
    fontWeight: "900",
  },
  backText: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.primaryDark,
  },
});
