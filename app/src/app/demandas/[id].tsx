import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  DemandaCard,
  loadCachedDemandas,
} from "@/repositories/demandasRepository";
import { formatTimeAgo } from "@/lib/timeAgo";
import { colors, rounded, spacing, type } from "@/theme/tokens";
import { Button } from "@/ui/Button";
import { ChevronLeftIcon } from "@/ui/ChevronLeftIcon";

function getAreaInitials(area: string): string {
  const clean = area.trim();
  if (clean.length <= 4) return clean.toUpperCase();
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

export default function DemandaDetalheScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [demanda, setDemanda] = useState<DemandaCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const cached = await loadCachedDemandas();
      const match = cached?.find((d) => d.id === id);
      if (match) {
        setDemanda(match);
      }
      setLoading(false);
    }
    void load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Carregando demanda…</Text>
      </View>
    );
  }

  // Se não encontrou no cache, usa fallback estruturado
  const data: DemandaCard = demanda ?? {
    id: id ?? "dem-placeholder",
    titulo: "Demanda do Campus",
    area: "Pesquisa & Extensão",
    habilidades: ["Colaboração", "Planejamento"],
    preview: "Detalhes desta demanda serão sincronizados com o servidor.",
    status: "aberta",
    autorNome: "Comunidade SETREM",
    autorPapel: "aluno",
    createdAt: new Date().toISOString(),
  };

  const isAberta = data.status === "aberta";
  const statusBg = isAberta ? colors.okSoft : colors.warnSoft;
  const statusColor = isAberta ? colors.ok : colors.warn;
  const statusLabel = isAberta
    ? "Aberta"
    : data.status === "em_andamento"
      ? "Em andamento"
      : data.status;
  const timeAgo = formatTimeAgo(data.createdAt);
  const areaInitials = getAreaInitials(data.area);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {/* Top Header */}
      <View style={styles.topNav}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          testID="demand-details-back"
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ChevronLeftIcon size={24} color={colors.ink} strokeWidth={2.5} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroBlock}>
          <View style={styles.areaRow}>
            <View style={styles.areaBadge}>
              <Text style={styles.areaBadgeText}>{areaInitials}</Text>
            </View>
            <View style={styles.areaInfo}>
              <Text style={styles.areaLabel}>{data.area}</Text>
              {timeAgo ? <Text style={styles.timeAgo}>Publicada {timeAgo}</Text> : null}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{data.titulo}</Text>

          <View style={styles.responsavelCard}>
            <Text style={styles.sectionLabel}>RESPONSÁVEL</Text>
            <View style={styles.responsavelInfo}>
              <Text style={styles.responsavelNome}>
                {data.autorPapel === "professor"
                  ? `Prof. ${data.autorNome ?? "SETREM"}`
                  : data.autorNome ?? "Membro da SETREM"}
              </Text>
              {data.autorPapel === "professor" ? (
                <View style={styles.profBadge}>
                  <Text style={styles.profBadgeText}>Professor</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* Problema / Descrição */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>O PROBLEMA</Text>
          <Text style={styles.bodyText}>
            {data.preview.length > 50
              ? data.preview
              : `${data.preview} Esta iniciativa visa integrar conhecimentos práticos com as necessidades reais dos cursos e laboratórios do campus, permitindo desenvolvimento colaborativo interdisciplinar.`}
          </Text>
        </View>

        {/* Resultado Esperado */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>RESULTADO ESPERADO</Text>
          <Text style={styles.bodyText}>
            Entrega de protótipo ou estudo aplicado validado em conjunto com a equipe
            responsável, com compartilhamento dos resultados para a comunidade acadêmica.
          </Text>
        </View>

        {/* Habilidades Necessárias */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>HABILIDADES BUSCADAS</Text>
          <View style={styles.skillsRow}>
            {data.habilidades.map((habilidade) => (
              <View key={habilidade} style={styles.skillTag}>
                <Text style={styles.skillText}>{habilidade}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Links Úteis */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>LINKS E REFERÊNCIAS</Text>
          <Text style={styles.linkText}>• Portal Institucional: setrem.com.br</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom CTA */}
      <View style={styles.bottomBar}>
        <Button
          label="Candidatar-se à demanda"
          variant="primary"
          onPress={() => {
            Alert.alert(
              "Candidatura",
              "A funcionalidade de candidaturas estruturadas será disponibilizada no próximo passo do Conecta Campus.",
            );
          }}
          testID="demand-apply-button"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: type.bodySm.fontSize,
    color: colors.muted,
  },
  topNav: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.screenGutter,
    paddingBottom: spacing.xs,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -spacing.xs,
  },
  pressed: {
    opacity: 0.6,
  },
  scrollContent: {
    padding: spacing.screenGutter,
    gap: spacing.lg,
    paddingBottom: 100,
  },
  heroBlock: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  areaBadge: {
    width: 44,
    height: 44,
    borderRadius: rounded.sm,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  areaBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  areaInfo: {
    flex: 1,
    gap: 2,
  },
  areaLabel: {
    fontSize: type.bodySm.fontSize,
    fontWeight: "600",
    color: colors.ink,
  },
  timeAgo: {
    fontSize: type.caption.fontSize,
    color: colors.faint,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: rounded.sm,
  },
  statusText: {
    fontSize: type.microUppercase.fontSize,
    fontWeight: type.microUppercase.fontWeight,
    lineHeight: type.microUppercase.lineHeight,
  },
  title: {
    fontFamily: type.screenTitle.fontFamily,
    fontSize: type.screenTitle.fontSize,
    fontWeight: type.screenTitle.fontWeight,
    lineHeight: type.screenTitle.lineHeight,
    color: colors.ink,
    marginTop: spacing.xxs,
  },
  responsavelCard: {
    backgroundColor: colors.paperDeep,
    borderRadius: rounded.xs,
    padding: spacing.sm,
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  sectionLabel: {
    fontSize: type.microUppercase.fontSize,
    fontWeight: type.microUppercase.fontWeight,
    letterSpacing: type.microUppercase.letterSpacing,
    color: colors.faint,
  },
  responsavelInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  responsavelNome: {
    fontSize: type.bodySm.fontSize,
    fontWeight: "500",
    color: colors.ink,
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
  section: {
    gap: spacing.xs,
  },
  sectionHeading: {
    fontSize: type.microUppercase.fontSize,
    fontWeight: type.microUppercase.fontWeight,
    letterSpacing: type.microUppercase.letterSpacing,
    color: colors.faint,
  },
  bodyText: {
    fontSize: type.bodyMd.fontSize,
    lineHeight: type.bodyMd.lineHeight,
    color: colors.ink,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  skillTag: {
    backgroundColor: colors.paperDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  skillText: {
    fontSize: type.caption.fontSize,
    color: colors.muted,
  },
  linkText: {
    fontSize: type.bodySm.fontSize,
    color: colors.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    padding: spacing.screenGutter,
  },
});
