import { z } from "zod";
import { and, desc, eq, ilike, inArray, isNull, lt, or, type SQL } from "drizzle-orm";
import { db } from "../../db";
import { demandaHabilidades, demandas, usuarios } from "../../db/schema";
import { requireUser } from "../lib/auth";
import { errorResponse } from "../lib/errors";

const statusEnum = z.enum(["aberta", "em_andamento", "concluida", "arquivada", "cancelada"]);

const listQuerySchema = z.object({
  after: z.string().min(1, "cursor inválido").optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  q: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  habilidade: z.string().min(1).optional(),
  status: statusEnum.optional(),
});

const DEFAULT_FEED_STATUS = ["aberta", "em_andamento"] as const;
const PREVIEW_LENGTH = 140;

function toPreview(problema: string): string {
  if (problema.length <= PREVIEW_LENGTH) return problema;
  return `${problema.slice(0, PREVIEW_LENGTH).trimEnd()}…`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (m) => `\\${m}`);
}

export async function handleListDemandas(req: Request, url: URL): Promise<Response> {
  const auth = await requireUser(req);
  if ("error" in auth) return auth.error;

  const params: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (["after", "limit", "q", "area", "habilidade", "status"].includes(key)) {
      params[key] = value;
    }
  }
  const parsed = listQuerySchema.safeParse(params);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".") || "query";
      fields[path] = issue.message;
    }
    return errorResponse(400, "VALIDATION_ERROR", "Corrija os campos destacados.", fields);
  }
  const query = parsed.data;

  const conditions: SQL[] = [isNull(demandas.hiddenAt)];

  if (query.status) {
    conditions.push(eq(demandas.status, query.status));
  } else {
    conditions.push(inArray(demandas.status, [...DEFAULT_FEED_STATUS]));
  }

  if (query.area) {
    conditions.push(eq(demandas.area, query.area));
  }

  if (query.q) {
    const like = `%${escapeLike(query.q)}%`;
    conditions.push(or(ilike(demandas.titulo, like), ilike(demandas.problema, like))!);
  }

  if (query.habilidade) {
    const withSkill = await db
      .select({ demandaId: demandaHabilidades.demandaId })
      .from(demandaHabilidades)
      .where(eq(demandaHabilidades.habilidade, query.habilidade));
    if (withSkill.length === 0) {
      return Response.json({ items: [], paging: { nextCursor: null, hasMore: false } });
    }
    conditions.push(
      inArray(
        demandas.id,
        withSkill.map((r) => r.demandaId),
      ),
    );
  }

  if (query.after) {
    const [cursor] = await db
      .select({ id: demandas.id, createdAt: demandas.createdAt })
      .from(demandas)
      .where(eq(demandas.id, query.after))
      .limit(1);
    if (!cursor) {
      return errorResponse(400, "VALIDATION_ERROR", "Corrija os campos destacados.", {
        after: "cursor inválido",
      });
    }
    conditions.push(
      or(
        lt(demandas.createdAt, cursor.createdAt),
        and(eq(demandas.createdAt, cursor.createdAt), lt(demandas.id, cursor.id)),
      )!,
    );
  }

  const rows = await db
    .select()
    .from(demandas)
    .where(and(...conditions))
    .orderBy(desc(demandas.createdAt), desc(demandas.id))
    .limit(query.limit + 1);

  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;

  const pageIds = page.map((r) => r.id);
  const habilidadesByDemanda = new Map<string, string[]>();
  if (pageIds.length > 0) {
    const habRows = await db
      .select()
      .from(demandaHabilidades)
      .where(inArray(demandaHabilidades.demandaId, pageIds));
    for (const hab of habRows) {
      const list = habilidadesByDemanda.get(hab.demandaId) ?? [];
      list.push(hab.habilidade);
      habilidadesByDemanda.set(hab.demandaId, list);
    }
  }

  const responsavelIds = [...new Set(page.map((r) => r.responsavelId))];
  const autores = new Map<string, { nome: string; papel: string }>();
  if (responsavelIds.length > 0) {
    const users = await db
      .select({ id: usuarios.id, nome: usuarios.nome, papel: usuarios.papel })
      .from(usuarios)
      .where(inArray(usuarios.id, responsavelIds));
    for (const u of users) {
      autores.set(u.id, { nome: u.nome, papel: u.papel });
    }
  }

  const items = page.map((r) => {
    const autor = autores.get(r.responsavelId);
    return {
      id: r.id,
      titulo: r.titulo,
      area: r.area,
      habilidades: habilidadesByDemanda.get(r.id) ?? [],
      preview: toPreview(r.problema),
      status: r.status,
      ...(autor ? { autorNome: autor.nome, autorPapel: autor.papel } : {}),
      createdAt: r.createdAt.toISOString(),
    };
  });

  return Response.json({
    items,
    paging: {
      nextCursor: hasMore ? items[items.length - 1].id : null,
      hasMore,
    },
  });
}
