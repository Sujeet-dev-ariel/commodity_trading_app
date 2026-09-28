import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

interface FormStatusProps {
  kind: "success" | "error" | "info";
  title?: string;
  message?: string | null;
}

/** eBay-style inline API response box. Rendered on every auth event. */
export function FormStatus({ kind, title, message }: FormStatusProps) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.box,
        kind === "success" ? styles.success : null,
        kind === "error" ? styles.error : null,
        kind === "info" ? styles.info : null,
      ]}
    >
      {title ? (
        <Text
          style={[
            styles.title,
            kind === "success" ? styles.successText : null,
            kind === "error" ? styles.errorText : null,
            kind === "info" ? styles.infoText : null,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {message ? (
        <Text
          style={[
            styles.message,
            title ? styles.messageOffset : null,
            kind === "success" ? styles.successText : null,
            kind === "error" ? styles.errorText : null,
            kind === "info" ? styles.infoText : null,
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    fontSize: 12.5,
  },
  messageOffset: {
    marginTop: 2,
  },
  success: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  successText: {
    color: colors.success,
  },
  error: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
  },
  info: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  infoText: {
    color: colors.primaryDark,
  },
});
