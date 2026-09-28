import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface ListingRowProps {
  title: string;
  subtitle: string;
  price: string;
  /** Small solid tag above the title (e.g. seller category). */
  tag?: string;
  /** Small outline badge under the price (e.g. requirement status). */
  badge?: string;
  onPress?: () => void;
}

/**
 * Shared commodity row — one component for buyer + seller
 * (parameterized, never duplicated per role).
 */
export function ListingRow({ title, subtitle, price, tag, badge, onPress }: ListingRowProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
    >
      <View style={styles.main}>
        {tag ? (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.side}>
        <Text style={styles.price}>{price}</Text>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.onPrimary,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12.5,
    color: colors.muted,
    marginTop: 2,
  },
  side: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.muted,
  },
});
