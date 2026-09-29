import { router } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

/**
 * Account button (Buyer App.html + Seller App.html `goProfile`):
 * 38px circle, primary background, white person icon, top-right of
 * every main screen. One shared component — parameterized by nothing,
 * both roles use the same button.
 */
export function ProfileButton() {
  return (
    <Pressable
      style={styles.button}
      onPress={() => router.push("/profile")}
      accessibilityRole="button"
      accessibilityLabel="Account"
      hitSlop={6}
    >
      <Svg
        width={19}
        height={19}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.onPrimary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <Circle cx={12} cy={7} r={4} />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
