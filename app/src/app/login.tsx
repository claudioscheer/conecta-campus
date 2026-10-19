import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/session/AuthProvider";
import { authLog } from "@/lib/logger";
import { colors, spacing, type } from "@/theme/tokens";
import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";

export default function LoginScreen() {
  const { isSignedIn, isSigningIn, authError, signInWithGoogle, clearError } =
    useAuth();

  useEffect(() => {
    if (isSignedIn) {
      authLog("ui", "login already signed in, redirecting to /");
    }
  }, [isSignedIn]);

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const handlePress = () => {
    authLog("ui", "login button pressed", { signingIn: isSigningIn });
    clearError();
    void signInWithGoogle();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Conecta Campus</Text>
        <Text style={styles.subtitle}>
          Entre com sua conta Google da SETREM para continuar.
        </Text>
        {authError !== null ? (
          <View style={styles.banner}>
            <Banner message={authError} variant="error" testID="login-error" />
          </View>
        ) : null}
        <Button
          label="Entrar com Google"
          onPress={handlePress}
          loading={isSigningIn}
          testID="login-submit"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.screenGutter,
    justifyContent: "center",
  },
  content: {
    gap: spacing.md,
  },
  title: {
    fontFamily: type.heading1.fontFamily,
    fontSize: type.heading1.fontSize,
    fontWeight: type.heading1.fontWeight,
    lineHeight: type.heading1.lineHeight,
    color: colors.ink,
  },
  subtitle: {
    fontSize: type.bodyMd.fontSize,
    lineHeight: type.bodyMd.lineHeight,
    color: colors.muted,
  },
  banner: {
    marginVertical: spacing.xs,
  },
});
