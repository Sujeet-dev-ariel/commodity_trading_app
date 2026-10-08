import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";

interface BackButtonProps {
  /** Screen-reader label, e.g. "Back to dashboard". Defaults to "Back". */
  accessibilityLabel?: string;
  /** Where to go when opened via deep link with no history to pop. */
  fallback?: Parameters<typeof router.replace>[0];
  /** Custom handler for multi-step flows (e.g. back to scan step). */
  onPress?: () => void;
}

/**
 * Shared back button (both prototypes use `← Back`): pops the navigation
 * stack, falling back to `fallback` when there is no history (deep link).
 */
export function BackButton({
  accessibilityLabel = "Back",
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
      style={styles.back}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text style={styles.backText}>← Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});
