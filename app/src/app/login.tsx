import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/session/AuthProvider";
import { authLog } from "@/lib/logger";
import { colors, spacing, type } from "@/theme/tokens";
import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";
import { GoogleIcon } from "@/ui/GoogleIcon";
import { TopographicHero } from "@/ui/TopographicHero";

export default function LoginScreen() {
  const { isSignedIn, isSigningIn, authError, signInWithGoogle, clearError } =
    useAuth();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

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

  const heroHeight = Math.min(Math.max(windowHeight * 0.44, 260), 380);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <TopographicHero height={heroHeight} />
      <View
        style={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.md,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>BEM-VINDO</Text>
          <Text style={styles.title}>Conecta Campus</Text>
          <Text style={styles.subtitle}>
            Demandas de pesquisa e TCC encontram quem tem a habilidade. Entre
            com sua conta Google da SETREM para continuar.
          </Text>
        </View>

        <View style={styles.actions}>
          {authError !== null ? (
            <Banner
              message={authError}
              variant="error"
              onClose={clearError}
              testID="login-error"
            />
          ) : null}

          <Button
            label="Entrar com Google"
            icon={<GoogleIcon size={18} color={colors.onPrimary} />}
            onPress={handlePress}
            loading={isSigningIn}
            testID="login-submit"
          />
          <Text style={styles.footerNote}>
            Exclusivo para contas @setrem.com.br
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenGutter,
    paddingTop: spacing.xs,
    justifyContent: "space-between",
  },
  header: {
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: type.microUppercase.fontSize,
    fontWeight: type.microUppercase.fontWeight,
    lineHeight: type.microUppercase.lineHeight,
    letterSpacing: type.microUppercase.letterSpacing,
    color: colors.primary,
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
  actions: {
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  footerNote: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    color: colors.faint,
    textAlign: "center",
  },
});
