import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { colors, rounded, spacing, type } from "@/theme/tokens";

type BannerProps = {
  message: string;
  variant: "error" | "offline";
  onClose?: () => void;
  testID?: string;
};

export function Banner({ message, variant, onClose, testID }: BannerProps) {
  const isError = variant === "error";

  return (
    <View
      accessibilityRole={isError ? "alert" : "text"}
      testID={testID}
      style={[styles.base, isError ? styles.error : styles.offline]}
    >
      {isError ? (
        <View style={styles.iconContainer}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Circle
              cx="10"
              cy="10"
              r="8.5"
              stroke="#FFFFFF"
              strokeWidth="1.75"
            />
            <Path
              d="M7 7L13 13M13 7L7 13"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </Svg>
        </View>
      ) : null}

      <Text
        style={[styles.text, isError ? styles.errorText : styles.offlineText]}
      >
        {message}
      </Text>

      {isError && onClose ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar aviso de erro"
          onPress={onClose}
          testID="login-error-close"
          hitSlop={8}
          style={styles.closeButton}
        >
          <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <Path
              d="M4 4L12 12M12 4L4 12"
              stroke="#FFFFFF"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: rounded.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  error: {
    backgroundColor: colors.danger,
    gap: spacing.sm,
  },
  offline: {
    backgroundColor: colors.primarySoft,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: type.bodySm.fontSize,
    lineHeight: type.bodySm.lineHeight,
  },
  errorText: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  offlineText: {
    color: colors.muted,
  },
  closeButton: {
    padding: spacing.xxs,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.9,
  },
});
