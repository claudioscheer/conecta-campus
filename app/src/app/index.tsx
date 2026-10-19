import { StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/session/AuthProvider";
import { colors, rounded, spacing, type } from "@/theme/tokens";
import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";

export default function HomePlaceholder() {
  const { isSignedIn, session, meStatus, isOffline, signOut, retryMe } =
    useAuth();

  if (!isSignedIn || session === null) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Conecta Campus</Text>
        {isOffline ? (
          <Banner
            message="Sem conexão. Mostrando o que estava salvo."
            variant="offline"
            testID="home-offline"
          />
        ) : null}
        {meStatus === "validating" ? (
          <Text style={styles.meta}>Confirmando sua sessão…</Text>
        ) : null}
        {isOffline ? (
          <Button
            label="Tentar novamente"
            variant="secondary"
            onPress={() => {
              void retryMe();
            }}
            testID="home-retry"
          />
        ) : null}
        <View style={styles.card}>
          <Text style={styles.name}>{session.usuario.nome}</Text>
          <Text style={styles.meta}>{session.usuario.email}</Text>
          <Text style={styles.meta}>Papel: {session.usuario.papel}</Text>
        </View>
        <Button
          label="Sair"
          variant="secondary"
          onPress={() => {
            void signOut();
          }}
          testID="home-logout"
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
    paddingTop: spacing.xl,
  },
  content: {
    gap: spacing.md,
  },
  title: {
    fontFamily: type.screenTitle.fontFamily,
    fontSize: type.screenTitle.fontSize,
    fontWeight: type.screenTitle.fontWeight,
    lineHeight: type.screenTitle.lineHeight,
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: type.bodyMdMedium.fontSize,
    fontWeight: type.bodyMdMedium.fontWeight,
    lineHeight: type.bodyMdMedium.lineHeight,
    color: colors.ink,
  },
  meta: {
    fontSize: type.bodySm.fontSize,
    lineHeight: type.bodySm.lineHeight,
    color: colors.muted,
  },
});
