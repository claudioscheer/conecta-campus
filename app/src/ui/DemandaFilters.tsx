import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { DemandaStatus } from "@/repositories/demandasRepository";
import { colors, rounded, spacing, type } from "@/theme/tokens";

interface DemandaFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: DemandaStatus | undefined;
  onStatusChange: (status: DemandaStatus | undefined) => void;
  selectedArea: string | undefined;
  onAreaChange: (area: string | undefined) => void;
  availableAreas: string[];
  isLoading?: boolean;
}

export function DemandaFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedArea,
  onAreaChange,
  availableAreas,
  isLoading = false,
}: DemandaFiltersProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título ou problema…"
          placeholderTextColor={colors.faint}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          testID="feed-search-input"
        />
        <View style={styles.searchRight}>
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              testID="search-loading-indicator"
            />
          ) : searchQuery.length > 0 ? (
            <Pressable
              style={styles.clearSearch}
              onPress={() => onSearchChange("")}
              testID="feed-search-clear"
              accessibilityLabel="Limpar busca"
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <Pressable
          style={[styles.chip, !selectedStatus && styles.chipActive]}
          onPress={() => onStatusChange(undefined)}
          testID="filter-status-all"
        >
          <Text style={[styles.chipText, !selectedStatus && styles.chipTextActive]}>
            Todos status
          </Text>
        </Pressable>

        <Pressable
          style={[styles.chip, selectedStatus === "aberta" && styles.chipActive]}
          onPress={() =>
            onStatusChange(selectedStatus === "aberta" ? undefined : "aberta")
          }
          testID="filter-status-aberta"
        >
          <Text
            style={[
              styles.chipText,
              selectedStatus === "aberta" && styles.chipTextActive,
            ]}
          >
            Abertas
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.chip,
            selectedStatus === "em_andamento" && styles.chipActive,
          ]}
          onPress={() =>
            onStatusChange(
              selectedStatus === "em_andamento" ? undefined : "em_andamento",
            )
          }
          testID="filter-status-em-andamento"
        >
          <Text
            style={[
              styles.chipText,
              selectedStatus === "em_andamento" && styles.chipTextActive,
            ]}
          >
            Em andamento
          </Text>
        </Pressable>

        {availableAreas.length > 0 ? <View style={styles.chipDivider} /> : null}

        {availableAreas.map((area) => {
          const isActive = selectedArea === area;
          return (
            <Pressable
              key={area}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onAreaChange(isActive ? undefined : area)}
              testID={`filter-area-${area}`}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {area}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  searchRow: {
    position: "relative",
    justifyContent: "center",
  },
  searchInput: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: type.bodySm.fontSize,
    color: colors.ink,
    paddingRight: 36,
  },
  searchRight: {
    position: "absolute",
    right: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  clearSearch: {
    padding: spacing.xxs,
  },
  clearSearchText: {
    color: colors.faint,
    fontSize: 14,
  },
  chipsScroll: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: rounded.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: type.caption.fontSize,
    fontWeight: "500",
    color: colors.muted,
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  chipDivider: {
    width: 1,
    backgroundColor: colors.line,
    marginVertical: 4,
  },
});
