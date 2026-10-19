import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, rounded, type } from "@/theme/tokens";

type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  testID,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled ? styles[`${variant}Pressed`] : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.onPrimary : colors.ink}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 44,
    borderRadius: rounded.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryDeep,
  },
  primaryText: {
    color: colors.onPrimary,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryPressed: {
    backgroundColor: colors.paperDeep,
  },
  secondaryText: {
    color: colors.ink,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
  },
  dangerPressed: {
    backgroundColor: colors.dangerSoft,
  },
  dangerText: {
    color: colors.danger,
  },
  text: {
    fontSize: type.buttonMd.fontSize,
    fontWeight: type.buttonMd.fontWeight,
  },
  disabled: {
    opacity: 0.4,
  },
});
