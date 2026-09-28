import { useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import { colors } from "@/theme/colors";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

const LENGTH = 4;

/** Four-box OTP input: each digit gets its own rounded box. */
export function OtpInput({ value, onChange, hasError }: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] ?? "");

  function focus(index: number) {
    inputs.current[index]?.focus();
  }

  function handleChange(index: number, text: string) {
    const clean = text.replace(/\D/g, "");
    const next = [...digits];
    if (clean.length === 0) {
      next[index] = "";
      onChange(next.join(""));
      return;
    }
    const chars = clean.slice(0, LENGTH - index).split("");
    chars.forEach((c, j) => {
      next[index + j] = c;
    });
    onChange(next.join(""));
    const lastFilled = index + chars.length - 1;
    if (lastFilled < LENGTH - 1) focus(lastFilled + 1);
    else inputs.current[LENGTH - 1]?.blur();
  }

  function handleKeyPress(
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    if (e.nativeEvent.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      onChange(next.join(""));
      focus(index - 1);
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, i) => (
        <TextInput
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          style={[
            styles.box,
            focusedIndex === i && styles.boxFocused,
            hasError && styles.boxError,
          ]}
          value={digit}
          onChangeText={(t) => handleChange(i, t)}
          onKeyPress={(e) => handleKeyPress(i, e)}
          onFocus={() => setFocusedIndex(i)}
          onBlur={() => setFocusedIndex(null)}
          keyboardType="number-pad"
          maxLength={i === 0 ? LENGTH : 1}
          autoCorrect={false}
          textAlign="center"
          selectTextOnFocus
          autoFocus={i === 0}
          testID={`otp-box-${i}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
  },
  box: {
    width: 52,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    backgroundColor: colors.card,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
    padding: 0,
  },
  boxFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryTint,
  },
  boxError: {
    borderColor: colors.danger,
  },
});
