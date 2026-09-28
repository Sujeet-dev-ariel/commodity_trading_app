import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Button } from "@/components/ui/Button";
import { FormStatus } from "@/components/ui/FormStatus";
import { OtpInput } from "@/features/auth/components/OtpInput";
import { useOtp } from "@/features/auth/hooks/useOtp";
import { formatPhoneDisplay } from "@/core/utils/validation";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VerifyOtpScreenProps {
  phone: string;
  expiresInSec?: number;
}

export function VerifyOtpScreen({ phone, expiresInSec }: VerifyOtpScreenProps) {
  const insets = useSafeAreaInsets();
  const { code, setCode, error, notice, isLoading, isResending, cooldown, verify, resend } =
    useOtp(phone);

  async function handleVerify() {
    const ok = await verify();
    if (!ok) return;
    router.replace("/terms");
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom + spacing.lg,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>Enter the code</Text>
          <Text style={styles.subtitle}>
            Sent to {formatPhoneDisplay(phone)}
            {expiresInSec !== undefined ? ` — valid for ${expiresInSec}s` : ""}.
          </Text>
        </View>
        <OtpInput value={code} onChange={setCode} hasError={!!error} />
        {error ? (
          <FormStatus kind="error" title="Request failed" message={error} />
        ) : null}
        {notice ? <FormStatus kind="success" message={notice} /> : null}
        <View style={styles.buttonWrap}>
          <Button title="Verify & continue" onPress={handleVerify} loading={isLoading} />
          <View style={styles.resendWrap}>
            <Button
              title={
                isResending
                  ? "Sending…"
                  : cooldown > 0
                    ? `Resend code in ${cooldown}s`
                    : "Resend code"
              }
              variant="ghost"
              onPress={resend}
              disabled={cooldown > 0 || isResending}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 20,
  },
  back: {
    alignSelf: "flex-start",
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  header: {
    marginTop: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  buttonWrap: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  resendWrap: {
    alignItems: "center",
  },
});
