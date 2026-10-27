import { describe, expect, it, vi } from "vitest";
import {
  DemandaApiError,
  DemandaCardSchema,
  DemandaListSchema,
  getDemandas,
  loadCachedDemandas,
  saveCachedDemandas,
} from "./demandasRepository";
import AsyncStorage from "@react-native-async-storage/async-storage";

vi.mock("@react-native-async-storage/async-storage", () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        store.delete(key);
      }),
      clear: vi.fn(async () => {
        store.clear();
      }),
    },
  };
});

describe("demandasRepository", () => {
  const mockCard = {
    id: "dem-1",
    titulo: "App para Estufa Inteligente",
    area: "Agronomia",
    habilidades: ["React Native", "Sensores"],
    preview: "Precisamos de app para ler umidade do solo...",
    status: "aberta" as const,
    autorNome: "Prof. Marcos",
    autorPapel: "professor" as const,
    createdAt: "2026-10-26T18:00:00.000Z",
  };

  it("validates valid DemandaCard", () => {
    const parsed = DemandaCardSchema.safeParse(mockCard);
    expect(parsed.success).toBe(true);
  });

  it("validates valid DemandaList", () => {
    const list = {
      items: [mockCard],
      paging: { nextCursor: null, hasMore: false },
    };
    const parsed = DemandaListSchema.safeParse(list);
    expect(parsed.success).toBe(true);
  });

  it("saves and loads cached demandas", async () => {
    await saveCachedDemandas([mockCard]);
    const cached = await loadCachedDemandas();
    expect(cached).toEqual([mockCard]);
  });

  it("fetches demandas successfully from API", async () => {
    const mockResponse = {
      items: [mockCard],
      paging: { nextCursor: null, hasMore: false },
    };

    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await getDemandas({
      baseUrl: "http://api.mock/v1",
      token: "valid-jwt",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].titulo).toBe("App para Estufa Inteligente");
    expect(fetchFn).toHaveBeenCalledWith(
      "http://api.mock/v1/demandas?limit=20",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer valid-jwt",
        }),
      }),
    );
  });

  it("appends query filters correctly", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ items: [], paging: { nextCursor: null, hasMore: false } }),
    });

    await getDemandas({
      baseUrl: "http://api.mock/v1",
      token: "valid-jwt",
      q: "sensores",
      area: "Agronomia",
      status: "aberta",
      fetchFn: fetchFn as unknown as typeof fetch,
    });

    expect(fetchFn).toHaveBeenCalledWith(
      "http://api.mock/v1/demandas?limit=20&q=sensores&area=Agronomia&status=aberta",
      expect.anything(),
    );
  });

  it("throws DemandaApiError with OFFLINE on network error", async () => {
    const fetchFn = vi.fn().mockRejectedValue(new TypeError("Network request failed"));

    await expect(
      getDemandas({
        baseUrl: "http://api.mock/v1",
        token: "valid-jwt",
        fetchFn: fetchFn as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({
      code: "OFFLINE",
    });
  });

  it("throws DemandaApiError with UNAUTHORIZED on 401", async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        error: { code: "UNAUTHORIZED", message: "Token inválido ou expirado." },
      }),
    });

    await expect(
      getDemandas({
        baseUrl: "http://api.mock/v1",
        token: "expired-jwt",
        fetchFn: fetchFn as unknown as typeof fetch,
      }),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
      status: 401,
    });
  });
});
