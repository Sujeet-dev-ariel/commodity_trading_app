import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "@/components/common/BackButton";
import { colors } from "@/theme/colors";

interface ProfileHeaderProps {
  /** Initial shown in the avatar circle (firm/user first letter). */
  initial: string;
}

/** "← Profile" back link + account avatar, shared by profile detail screens. */
export function ProfileHeader({ initial }: ProfileHeaderProps) {
  return (
    <View style={styles.headRow}>
      <BackButton
        accessibilityLabel="Back to profile"
        fallback="/profile"
      />
      <View style={styles.headAvatar}>
        <Text style={styles.headAvatarText}>{initial}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  headAvatarText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.onPrimary,
  },
});
