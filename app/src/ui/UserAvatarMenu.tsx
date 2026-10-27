import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/session/AuthProvider";
import { colors, rounded, spacing, type } from "@/theme/tokens";
import { Button } from "./Button";

interface UserAvatarMenuProps {
  testID?: string;
}

export function UserAvatarMenu({ testID }: UserAvatarMenuProps) {
  const { session, signOut, isOffline } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!session) return null;

  const emailInitial = (session.usuario.email.trim()[0] ?? "U").toUpperCase();

  return (
    <>
      <Pressable
        onPress={() => setIsOpen(true)}
        style={({ pressed }) => [styles.avatarButton, pressed && styles.avatarPressed]}
        testID={testID ?? "user-avatar-button"}
        accessibilityRole="button"
        accessibilityLabel={`Perfil de ${session.usuario.nome}`}
      >
        <Text style={styles.avatarInitial}>{emailInitial}</Text>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatarLarge}>
                <Text style={styles.avatarLargeInitial}>{emailInitial}</Text>
              </View>
              <View style={styles.menuUserInfo}>
                <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                  {session.usuario.nome}
                </Text>
                <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
                  {session.usuario.email}
                </Text>
              </View>
            </View>

            <View style={styles.badgeRow}>
              <View style={styles.papelBadge}>
                <Text style={styles.papelText}>
                  {session.usuario.papel.toUpperCase()}
                </Text>
              </View>
            </View>

            {isOffline ? (
              <View style={styles.offlineBox}>
                <Text style={styles.offlineText}>Sem conexão. Mostrando dados locais.</Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <Button
              label="Sair da conta"
              variant="secondary"
              onPress={async () => {
                setIsOpen(false);
                await signOut();
              }}
              testID="menu-logout-button"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressed: {
    opacity: 0.8,
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(28, 25, 23, 0.35)",
    paddingTop: 80,
    paddingHorizontal: spacing.screenGutter,
  },
  menuContainer: {
    width: 290,
    maxWidth: "90%",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: rounded.sm,
    padding: spacing.md,
    alignSelf: "flex-start",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuAvatarLarge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLargeInitial: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  menuUserInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 2,
  },
  userName: {
    fontSize: type.bodyMdMedium.fontSize,
    fontWeight: type.bodyMdMedium.fontWeight,
    lineHeight: 20,
    color: colors.ink,
  },
  userEmail: {
    fontSize: type.caption.fontSize,
    lineHeight: 16,
    color: colors.muted,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  papelBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: rounded.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  papelText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  offlineBox: {
    backgroundColor: colors.warnSoft,
    padding: spacing.xs,
    borderRadius: rounded.xs,
    marginTop: spacing.xs,
  },
  offlineText: {
    fontSize: type.caption.fontSize,
    color: colors.warn,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
});
