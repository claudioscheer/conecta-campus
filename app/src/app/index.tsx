import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/session/AuthProvider";
import { getApiBaseUrl } from "@/config";
import { authLog } from "@/lib/logger";
import {
  DemandaCard as DemandaCardType,
  DemandaStatus,
  getDemandas,
  loadCachedDemandas,
  saveCachedDemandas,
} from "@/repositories/demandasRepository";
import { colors, spacing, type } from "@/theme/tokens";
import { Banner } from "@/ui/Banner";
import { Button } from "@/ui/Button";
import { DemandaCard } from "@/ui/DemandaCard";
import { DemandaFilters } from "@/ui/DemandaFilters";
import { UserAvatarMenu } from "@/ui/UserAvatarMenu";

export default function DemandaFeedScreen() {
  const router = useRouter();
  const { isSignedIn, session, isOffline } = useAuth();

  const [items, setItems] = useState<DemandaCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtros e busca com debounce
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState<DemandaStatus | undefined>(
    undefined,
  );
  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined);

  // Debounce do campo de busca (350ms)
  useEffect(() => {
    if (searchQuery !== debouncedQuery) {
      setIsDebouncing(true);
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsDebouncing(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedQuery]);

  // Carregar cache inicial (startup rápido)
  useEffect(() => {
    let isMounted = true;
    async function loadCache() {
      const cached = await loadCachedDemandas();
      if (isMounted && cached && cached.length > 0) {
        setItems(cached);
        setLoading(false);
      }
    }
    void loadCache();
    return () => {
      isMounted = false;
    };
  }, []);

  const loadData = useCallback(
    async (isManualRefresh = false) => {
      if (!session) return;
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setErrorMessage(null);

      try {
        const baseUrl = getApiBaseUrl();
        const response = await getDemandas({
          baseUrl,
          token: session.token,
          q: debouncedQuery,
          status: selectedStatus,
          area: selectedArea,
        });

        setItems(response.items);
        // Salva no cache apenas se não houver filtro restritivo ativo
        if (!debouncedQuery && !selectedStatus && !selectedArea) {
          void saveCachedDemandas(response.items);
        }
      } catch (err: unknown) {
        authLog("ui", "loadDemandas failed", { error: String(err) });
        if (items.length === 0) {
          setErrorMessage("Não foi possível carregar as demandas no momento.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setIsFiltering(false);
      }
    },
    [session, debouncedQuery, selectedStatus, selectedArea, items.length],
  );

  // Recarrega sempre que filtros ou busca debounced mudam
  useEffect(() => {
    if (session) {
      void loadData();
    }
  }, [session, debouncedQuery, selectedStatus, selectedArea]);

  // Áreas disponíveis extraídas dos itens carregados
  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.area) set.add(item.area);
    }
    return Array.from(set).sort();
  }, [items]);

  if (!isSignedIn || session === null) {
    return <Redirect href="/login" />;
  }

  const handleCardPress = (item: DemandaCardType) => {
    router.push({
      pathname: "/demandas/[id]",
      params: { id: item.id },
    });
  };

  const handleStatusChange = (status: DemandaStatus | undefined) => {
    setIsFiltering(true);
    setSelectedStatus(status);
  };

  const handleAreaChange = (area: string | undefined) => {
    setIsFiltering(true);
    setSelectedArea(area);
  };

  const handleClearFilters = () => {
    setIsFiltering(true);
    setSearchQuery("");
    setDebouncedQuery("");
    setSelectedStatus(undefined);
    setSelectedArea(undefined);
  };

  const isSearching = isDebouncing || isFiltering || loading;

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />

      {/* Top Header - Avatar com mais respiro/espaço */}
      <View style={styles.topHeader}>
        <UserAvatarMenu />
      </View>

      {/* Offline Banner */}
      {isOffline ? (
        <View style={styles.bannerContainer}>
          <Banner
            message="Sem conexão. Mostrando o que estava salvo."
            variant="offline"
            testID="feed-offline-banner"
          />
        </View>
      ) : null}

      {/* Error Banner */}
      {errorMessage ? (
        <View style={styles.bannerContainer}>
          <Banner
            message={errorMessage}
            variant="error"
            testID="feed-error-banner"
          />
        </View>
      ) : null}

      {/* Filtros e Busca com Debounce e Indicador */}
      <View style={styles.filtersWrapper}>
        <DemandaFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          selectedArea={selectedArea}
          onAreaChange={handleAreaChange}
          availableAreas={availableAreas}
          isLoading={isSearching}
        />
      </View>

      {/* Feedback de busca ativa ou filtros */}
      {isSearching && items.length > 0 ? (
        <View style={styles.searchingFeedback}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.searchingFeedbackText}>Buscando demandas…</Text>
        </View>
      ) : null}

      {/* Lista de Demandas */}
      {loading && items.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Buscando demandas do campus…</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <DemandaCard item={item} onPress={handleCardPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadData(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Nada para esses filtros.</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os filtros ou pesquisar com outros termos.
              </Text>
              {searchQuery || selectedStatus || selectedArea ? (
                <View style={styles.clearButtonWrapper}>
                  <Button
                    label="Limpar filtros"
                    variant="secondary"
                    onPress={handleClearFilters}
                    testID="feed-clear-filters"
                  />
                </View>
              ) : null}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    paddingTop: spacing.xl,
  },
  topHeader: {
    paddingHorizontal: spacing.screenGutter,
    marginBottom: spacing.md,
    alignItems: "flex-start",
  },
  bannerContainer: {
    paddingHorizontal: spacing.screenGutter,
    marginBottom: spacing.xs,
  },
  filtersWrapper: {
    paddingHorizontal: spacing.screenGutter,
    paddingBottom: spacing.xs,
  },
  searchingFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.screenGutter,
    paddingVertical: spacing.xxs,
  },
  searchingFeedbackText: {
    fontSize: type.caption.fontSize,
    color: colors.muted,
  },
  listContent: {
    paddingHorizontal: spacing.screenGutter,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontSize: type.bodySm.fontSize,
    color: colors.muted,
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyTitle: {
    fontSize: type.bodyMdMedium.fontSize,
    fontWeight: type.bodyMdMedium.fontWeight,
    color: colors.ink,
  },
  emptySubtitle: {
    fontSize: type.bodySm.fontSize,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 260,
  },
  clearButtonWrapper: {
    marginTop: spacing.sm,
  },
});
