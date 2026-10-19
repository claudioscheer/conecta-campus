import { StyleSheet, Text, View } from "react-native";
import { colors, rounded, spacing, type } from "@/theme/tokens";

type BannerProps = {
  message: string;
  variant: "error" | "offline";
  testID?: string;
};

export function Banner({ message, variant, testID }: BannerProps) {
  return (
    <View
      accessibilityRole={variant === "error" ? "alert" : "text"}
      testID={testID}
      style={[styles.base, variant === "error" ? styles.error : styles.offline]}
    >
      <Text
        style={[styles.text, variant === "error" ? styles.errorText : styles.offlineText]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rounded.sm,
  },
  error: {
    backgroundColor: colors.dangerSoft,
  },
  offline: {
    backgroundColor: colors.primarySoft,
  },
  text: {
    fontSize: type.bodySm.fontSize,
    lineHeight: type.bodySm.lineHeight,
  },
  errorText: {
    color: colors.danger,
  },
  offlineText: {
    color: colors.muted,
  },
});
