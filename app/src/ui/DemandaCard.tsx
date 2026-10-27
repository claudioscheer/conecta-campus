import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DemandaCard as DemandaCardType } from "@/repositories/demandasRepository";
import { formatTimeAgo } from "@/lib/timeAgo";
import { colors, rounded, spacing, type } from "@/theme/tokens";

interface DemandaCardProps {
  item: DemandaCardType;
  onPress: (item: DemandaCardType) => void;
  testID?: string;
}

function getAreaInitials(area: string): string {
  const clean = area.trim();
  if (clean.length <= 4) return clean.toUpperCase();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

function StatusBadge({ status }: { status: DemandaCardType["status"] }) {
  const isAberta = status === "aberta";
  const bg = isAberta ? colors.okSoft : colors.warnSoft;
  const textColor = isAberta ? colors.ok : colors.warn;
  const label = isAberta ? "Aberta" : status === "em_andamento" ? "Em andamento" : status;

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export function DemandaCard({ item, onPress, testID }: DemandaCardProps) {
  const timeAgo = formatTimeAgo(item.createdAt);
  const initials = getAreaInitials(item.area);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress(item)}
      testID={testID ?? `demanda-card-${item.id}`}
      accessibilityRole="button"
      accessibilityLabel={`Demanda: ${item.titulo}`}
    >
      <View style={styles.headerRow}>
        <View style={styles.areaBadge}>
          <Text style={styles.areaBadgeText}>{initials}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.titulo}
          </Text>
          <View style={styles.metaRow}>
            {item.autorNome ? (
              <Text style={styles.autor} numberOfLines={1}>
                {item.autorPapel === "professor" ? `Prof. ${item.autorNome}` : item.autorNome}
              </Text>
            ) : null}
            {item.autorPapel === "professor" ? (
              <View style={styles.profBadge}>
                <Text style={styles.profBadgeText}>Professor</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.statusCol}>
          <StatusBadge status={item.status} />
          {timeAgo ? <Text style={styles.statusTimeAgo}>{timeAgo}</Text> : null}
        </View>
      </View>

      <Text style={styles.preview} numberOfLines={2}>
        {item.preview}
      </Text>

      {item.habilidades.length > 0 ? (
        <View style={styles.skillsRow}>
          {item.habilidades.slice(0, 3).map((habilidade) => (
            <View key={habilidade} style={styles.skillTag}>
              <Text style={styles.skillText}>{habilidade}</Text>
            </View>
          ))}
          {item.habilidades.length > 3 ? (
            <Text style={styles.moreSkills}>+{item.habilidades.length - 3}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.sm,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardPressed: {
    backgroundColor: colors.paperDeep,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  areaBadge: {
    width: 40,
    height: 40,
    borderRadius: rounded.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  areaBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: type.headingCard.fontSize,
    fontWeight: type.headingCard.fontWeight,
    lineHeight: type.headingCard.lineHeight,
    color: colors.ink,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.xxs,
  },
  autor: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    color: colors.muted,
  },
  profBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.xxs,
    paddingVertical: 1,
    borderRadius: rounded.xs,
  },
  profBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
  },
  statusCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: rounded.sm,
  },
  statusText: {
    fontSize: type.microUppercase.fontSize,
    fontWeight: type.microUppercase.fontWeight,
    lineHeight: type.microUppercase.lineHeight,
  },
  statusTimeAgo: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    color: colors.faint,
  },
  preview: {
    fontSize: type.bodySm.fontSize,
    lineHeight: type.bodySm.lineHeight,
    color: colors.muted,
    marginTop: 2,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  skillTag: {
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  skillText: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    color: colors.muted,
  },
  moreSkills: {
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    color: colors.faint,
    marginLeft: spacing.xxs,
  },
});
