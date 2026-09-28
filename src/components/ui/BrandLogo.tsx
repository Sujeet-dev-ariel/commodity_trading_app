import { StyleSheet, Text, View } from "react-native";

/**
 * Default placeholder brand mark — no logo asset needed.
 * Letters cycle through the classic marketplace 4-color palette
 * (red / blue / yellow / green), eBay-style. Swap `name` or replace
 * with an <Image> once the client supplies a real logo.
 */
const LETTER_COLORS = ["#E53238", "#0064D2", "#F5AF02", "#86B817"];

interface BrandLogoProps {
  name?: string;
  size?: number;
}

export function BrandLogo({ name = "ismail", size = 44 }: BrandLogoProps) {
  return (
    <View accessibilityRole="header" style={styles.wrap}>
      <Text style={[styles.word, { fontSize: size }]}>
        {name.split("").map((letter, i) => (
          <Text key={`${letter}-${i}`} style={{ color: LETTER_COLORS[i % LETTER_COLORS.length] }}>
            {letter}
          </Text>
        ))}
      </Text>
      <Text style={styles.tagline}>COMMODITY TRADING</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  word: {
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "700",
    color: "#707070",
    marginTop: 2,
  },
});
