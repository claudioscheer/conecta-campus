import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PapelSchema } from "./authRepository";
import { authLog } from "@/lib/logger";

export const DemandaStatusSchema = z.enum([
  "aberta",
  "em_andamento",
  "concluida",
  "arquivada",
  "cancelada",
]);
export type DemandaStatus = z.infer<typeof DemandaStatusSchema>;

export const DemandaCardSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  area: z.string().min(1),
  habilidades: z.array(z.string()),
  preview: z.string(),
  status: DemandaStatusSchema,
  autorNome: z.string().optional(),
  autorPapel: PapelSchema.optional(),
  createdAt: z.string(),
});
export type DemandaCard = z.infer<typeof DemandaCardSchema>;

export const DemandaListSchema = z.object({
  items: z.array(DemandaCardSchema),
  paging: z.object({
    nextCursor: z.string().nullable(),
    hasMore: z.boolean(),
  }),
});
export type DemandaList = z.infer<typeof DemandaListSchema>;

export const DemandaDetalheSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  area: z.string().min(1),
  habilidades: z.array(z.string()),
  problema: z.string(),
  resultadoEsperado: z.string(),
  status: DemandaStatusSchema,
  resultadoUrl: z.string().nullable().optional(),
  links: z.array(z.string()).default([]),
  responsavel: z.object({
    id: z.string(),
    nome: z.string(),
    papel: PapelSchema,
  }),
  contato: z
    .object({
      email: z.string().email().optional(),
      link: z.string().url().optional(),
    })
    .nullable()
    .optional(),
  candidaturaAtual: z
    .object({
      id: z.string(),
      status: z.enum(["pendente", "aceita", "recusada"]),
      categoria: z.string(),
      mensagem: z.string(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
export type DemandaDetalhe = z.infer<typeof DemandaDetalheSchema>;

export class DemandaApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly userMessage: string;

  constructor(args: { status: number; code: string; userMessage: string }) {
    super(args.userMessage);
    this.name = "DemandaApiError";
    this.status = args.status;
    this.code = args.code;
    this.userMessage = args.userMessage;
  }
}

const DEMANDAS_CACHE_KEY = "conecta.cache.demandas";

export async function loadCachedDemandas(): Promise<DemandaCard[] | null> {
  try {
    const raw = await AsyncStorage.getItem(DEMANDAS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = z.array(DemandaCardSchema).safeParse(parsed);
    if (result.success) {
      return result.data;
    }
    return null;
  } catch (error) {
    authLog("api", "loadCachedDemandas failed", { error: String(error) });
    return null;
  }
}

export async function saveCachedDemandas(items: DemandaCard[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DEMANDAS_CACHE_KEY, JSON.stringify(items));
  } catch (error) {
    authLog("api", "saveCachedDemandas failed", { error: String(error) });
  }
}

type GetDemandasArgs = {
  baseUrl: string;
  token: string;
  q?: string;
  area?: string;
  status?: DemandaStatus;
  habilidade?: string;
  after?: string;
  limit?: number;
  fetchFn?: typeof fetch;
};

export async function getDemandas({
  baseUrl,
  token,
  q,
  area,
  status,
  habilidade,
  after,
  limit = 20,
  fetchFn = fetch,
}: GetDemandasArgs): Promise<DemandaList> {
  const queryParams = new URLSearchParams();
  queryParams.set("limit", String(limit));
  if (q && q.trim().length > 0) queryParams.set("q", q.trim());
  if (area && area.trim().length > 0) queryParams.set("area", area.trim());
  if (status) queryParams.set("status", status);
  if (habilidade && habilidade.trim().length > 0) queryParams.set("habilidade", habilidade.trim());
  if (after) queryParams.set("after", after);

  const url = `${baseUrl}/demandas?${queryParams.toString()}`;

  let response: Response;
  try {
    response = await fetchFn(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new DemandaApiError({
      status: 0,
      code: "OFFLINE",
      userMessage: "Sem conexão de rede.",
    });
  }

  if (response.status === 401) {
    throw new DemandaApiError({
      status: 401,
      code: "UNAUTHORIZED",
      userMessage: "Sua sessão expirou. Faça login novamente.",
    });
  }

  if (!response.ok) {
    throw new DemandaApiError({
      status: response.status,
      code: "SERVER_ERROR",
      userMessage: "Não foi possível carregar as demandas.",
    });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new DemandaApiError({
      status: 502,
      code: "SERVER_ERROR",
      userMessage: "Resposta inválida do servidor.",
    });
  }

  const parsed = DemandaListSchema.safeParse(body);
  if (!parsed.success) {
    throw new DemandaApiError({
      status: 502,
      code: "SERVER_ERROR",
      userMessage: "Estrutura de demandas inesperada.",
    });
  }

  return parsed.data;
}
