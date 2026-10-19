import { describe, expect, it } from "bun:test";
import { eq, inArray } from "drizzle-orm";
import { handleRequest } from "../src/routes";
import { signAppToken } from "../src/lib/jwt";
import { db } from "../db";
import { usuarios, demandas, demandaHabilidades } from "../db/schema";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

interface DemandaCard {
  id: string;
  titulo: string;
  area: string;
  habilidades: string[];
  preview: string;
  status: string;
  autorNome?: string;
  autorPapel?: string;
  createdAt: string;
}

interface ListResponseBody {
  items: DemandaCard[];
  paging: { nextCursor: string | null; hasMore: boolean };
}

const uniq = () => `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;

async function createUser(papel: "aluno" | "professor" | "moderador" = "aluno") {
  const suffix = uniq();
  const [user] = await db
    .insert(usuarios)
    .values({
      id: crypto.randomUUID(),
      googleSub: `google-sub-feed-${suffix}`,
      nome: "Ana Souza",
      email: `feed.${suffix}@setrem.com.br`,
      papel,
    })
    .returning();
  const token = await signAppToken({
    id: user.id,
    email: user.email,
    papel: user.papel,
    nome: user.nome,
  });
  return { user, token };
}

async function createDemanda(
  responsavelId: string,
  overrides: {
    titulo?: string;
    area?: string;
    problema?: string;
    status?: "aberta" | "em_andamento" | "concluida" | "arquivada" | "cancelada";
    hidden?: boolean;
    habilidades?: string[];
    createdAt?: Date;
  } = {},
) {
  const suffix = uniq();
  const [row] = await db
    .insert(demandas)
    .values({
      id: crypto.randomUUID(),
      responsavelId,
      titulo: overrides.titulo ?? `Sensores na estufa ${suffix}`,
      area: overrides.area ?? "Agronomia",
      problema:
        overrides.problema ??
        "Precisamos ligar a umidade do solo a um painel no celular para monitorar a estufa do bloco B durante todo o semestre letivo.",
      resultadoEsperado: "Painel funcionando com leituras diárias.",
      status: overrides.status ?? "aberta",
      hiddenAt: overrides.hidden ? new Date() : null,
      createdAt: overrides.createdAt,
    })
    .returning();
  const habs = overrides.habilidades ?? ["TI", "Sensores"];
  if (habs.length > 0) {
    await db.insert(demandaHabilidades).values(
      habs.map((habilidade) => ({ demandaId: row.id, habilidade })),
    );
  }
  return row;
}

async function cleanupDemandas(ids: string[], userIds: string[]) {
  if (ids.length > 0) {
    await db.delete(demandaHabilidades).where(inArray(demandaHabilidades.demandaId, ids));
    await db.delete(demandas).where(inArray(demandas.id, ids));
  }
  for (const userId of userIds) {
    await db.delete(usuarios).where(eq(usuarios.id, userId));
  }
}

describe("RF-05/RF-06/RF-07 · Feed de demandas (GET /v1/demandas)", () => {
  it("deve retornar 401 UNAUTHORIZED sem Bearer", async () => {
    const req = new Request("http://localhost:3000/v1/demandas");
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("deve retornar 401 UNAUTHORIZED com token inválido", async () => {
    const req = new Request("http://localhost:3000/v1/demandas", {
      headers: { Authorization: "Bearer token-falso" },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("deve retornar 400 VALIDATION_ERROR com limit fora de 1..50", async () => {
    const { user, token } = await createUser();
    const req = new Request("http://localhost:3000/v1/demandas?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.fields?.limit).toBeDefined();
    await cleanupDemandas([], [user.id]);
  });

  it("deve retornar 400 VALIDATION_ERROR com status inválido", async () => {
    const { user, token } = await createUser();
    const req = new Request("http://localhost:3000/v1/demandas?status=invalido", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("VALIDATION_ERROR");
    await cleanupDemandas([], [user.id]);
  });

  it("deve listar aberta/em_andamento primeiro (mais nova antes), sem vazar problema/contato", async () => {
    const { user, token } = await createUser("professor");
    const tag = uniq();
    const antiga = await createDemanda(user.id, {
      titulo: `Feed antiga ${tag}`,
      createdAt: new Date("2026-01-01T10:00:00Z"),
    });
    const nova = await createDemanda(user.id, {
      titulo: `Feed nova ${tag}`,
      createdAt: new Date("2026-06-01T10:00:00Z"),
    });
    const concluida = await createDemanda(user.id, {
      titulo: `Feed concluida ${tag}`,
      status: "concluida",
      createdAt: new Date("2026-07-01T10:00:00Z"),
    });
    const oculta = await createDemanda(user.id, {
      titulo: `Feed oculta ${tag}`,
      hidden: true,
      createdAt: new Date("2026-08-01T10:00:00Z"),
    });
    const ids = [antiga.id, nova.id, concluida.id, oculta.id];

    const req = new Request(`http://localhost:3000/v1/demandas?q=${encodeURIComponent(tag)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as ListResponseBody;

    expect(body.items.length).toBe(2);
    expect(body.items[0].id).toBe(nova.id);
    expect(body.items[1].id).toBe(antiga.id);

    const card = body.items[0];
    expect(card.titulo).toBe(`Feed nova ${tag}`);
    expect(card.area).toBe("Agronomia");
    expect([...card.habilidades].sort()).toEqual(["Sensores", "TI"]);
    expect(card.status).toBe("aberta");
    expect(card.autorNome).toBe("Ana Souza");
    expect(card.autorPapel).toBe("professor");
    expect(typeof card.createdAt).toBe("string");
    // Card compacto: sem problema completo, sem contato, sem candidaturas
    expect(card).not.toHaveProperty("problema");
    expect(card).not.toHaveProperty("contato");
    expect(card).not.toHaveProperty("candidaturas");
    expect((card as Record<string, unknown>).preview).toBeDefined();

    await cleanupDemandas(ids, [user.id]);
  });

  it("deve filtrar por area, habilidade e status, e buscar q em titulo/problema", async () => {
    const { user, token } = await createUser();
    const tag = uniq();
    const alvo = await createDemanda(user.id, {
      titulo: `Filtro alvo ${tag} estufa`,
      area: "Agronomia",
      habilidades: ["Sensores"],
      status: "aberta",
    });
    const outra = await createDemanda(user.id, {
      titulo: `Filtro outra ${tag}`,
      area: "Saude",
      habilidades: ["Escrita"],
      status: "aberta",
    });
    const emAnd = await createDemanda(user.id, {
      titulo: `Filtro andamento ${tag}`,
      area: "Agronomia",
      habilidades: ["Sensores"],
      status: "em_andamento",
    });
    const ids = [alvo.id, outra.id, emAnd.id];

    async function get(query: string) {
      const req = new Request(`http://localhost:3000/v1/demandas${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const res = await handleRequest(req);
      expect(res.status).toBe(200);
      return (await res.json()) as ListResponseBody;
    }

    const porArea = await get(`?q=${encodeURIComponent(tag)}&area=Saude`);
    expect(porArea.items.map((i) => i.id)).toEqual([outra.id]);

    const porHab = await get(`?q=${encodeURIComponent(tag)}&habilidade=Escrita`);
    expect(porHab.items.map((i) => i.id)).toEqual([outra.id]);

    const porStatus = await get(`?q=${encodeURIComponent(tag)}&status=em_andamento`);
    expect(porStatus.items.map((i) => i.id)).toEqual([emAnd.id]);

    const porQ = await get(`?q=${encodeURIComponent(`alvo ${tag} estufa`)}`);
    expect(porQ.items.map((i) => i.id)).toContain(alvo.id);

    await cleanupDemandas(ids, [user.id]);
  });

  it("deve paginar com after + limit sem repetir", async () => {
    const { user, token } = await createUser();
    const tag = uniq();
    const d1 = await createDemanda(user.id, {
      titulo: `Pag 1 ${tag}`,
      createdAt: new Date("2026-03-01T10:00:00Z"),
    });
    const d2 = await createDemanda(user.id, {
      titulo: `Pag 2 ${tag}`,
      createdAt: new Date("2026-04-01T10:00:00Z"),
    });
    const d3 = await createDemanda(user.id, {
      titulo: `Pag 3 ${tag}`,
      createdAt: new Date("2026-05-01T10:00:00Z"),
    });
    const ids = [d1.id, d2.id, d3.id];
    const q = encodeURIComponent(tag);

    const req1 = new Request(`http://localhost:3000/v1/demandas?q=${q}&limit=2`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res1 = await handleRequest(req1);
    expect(res1.status).toBe(200);
    const page1 = (await res1.json()) as ListResponseBody;
    expect(page1.items.map((i) => i.id)).toEqual([d3.id, d2.id]);
    expect(page1.paging.hasMore).toBe(true);
    expect(page1.paging.nextCursor).toBe(d2.id);

    const req2 = new Request(
      `http://localhost:3000/v1/demandas?q=${q}&limit=2&after=${d2.id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    const res2 = await handleRequest(req2);
    expect(res2.status).toBe(200);
    const page2 = (await res2.json()) as ListResponseBody;
    expect(page2.items.map((i) => i.id)).toEqual([d1.id]);
    expect(page2.paging.hasMore).toBe(false);

    await cleanupDemandas(ids, [user.id]);
  });
});
