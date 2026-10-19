import { eq, inArray } from "drizzle-orm";
import { db } from "./index";
import { demandaHabilidades, demandaLinks, demandas, usuarios } from "./schema";

// Seed de desenvolvimento: feed legível para teste manual via curl/dev-login.
// Idempotente: apaga as demandas com os mesmos títulos antes de inserir.
// Uso: bun run db/seed.ts

const EMAIL = "claudio.junior@setrem.com.br";

interface Seed {
  titulo: string;
  area: string;
  problema: string;
  resultadoEsperado: string;
  status: "aberta" | "em_andamento" | "concluida" | "arquivada" | "cancelada";
  habilidades: string[];
  links?: string[];
  resultadoUrl?: string;
  diasAtras: number;
}

const SEEDS: Seed[] = [
  {
    titulo: "Sensores na estufa do bloco B",
    area: "Agronomia",
    problema:
      "Precisamos ligar a umidade do solo e a temperatura da estufa do bloco B a um painel simples no celular. Temos os sensores, falta quem saiba programar a leitura e desenhar o painel para consulta diária.",
    resultadoEsperado: "Painel no celular com leitura diária de umidade e temperatura.",
    status: "aberta",
    habilidades: ["Sensores", "TI"],
    links: ["https://drive.google.com/exemplo-estufa"],
    diasAtras: 0,
  },
  {
    titulo: "App de triagem para a clínica-escola",
    area: "Saude",
    problema:
      "A clínica-escola recebe pacientes em papel e perde tempo na triagem. Queremos um protótipo de app que registre nome, queixa e prioridade, mesmo que funcione só no navegador do computador da recepção.",
    resultadoEsperado: "Protótipo navegável testado por uma semana na recepção.",
    status: "aberta",
    habilidades: ["Programacao", "Analise de dados"],
    diasAtras: 1,
  },
  {
    titulo: "Análise de solo das parcelas do campus",
    area: "Agronomia",
    problema:
      "Coletamos 40 amostras de solo das parcelas experimentais e precisamos de ajuda para organizar os dados em planilha, rodar estatísticas básicas e gerar gráficos para o TCC.",
    resultadoEsperado: "Planilha limpa + relatório com gráficos.",
    status: "em_andamento",
    habilidades: ["Analise de dados", "Campo"],
    diasAtras: 3,
  },
  {
    titulo: "Identidade visual da semana acadêmica",
    area: "Comunicacao",
    problema:
      "A semana acadêmica precisa de cartaz, posts e crachás com uma identidade única. Temos o tema e os textos, falta quem desenhe as peças e revise a escrita.",
    resultadoEsperado: "Kit com cartaz, 5 posts e modelo de crachá.",
    status: "aberta",
    habilidades: ["Desenho", "Escrita"],
    diasAtras: 5,
  },
  {
    titulo: "Mapeamento de pragas com armadilhas fotográficas",
    area: "Agronomia",
    problema:
      "Instalamos armadilhas fotográficas na lavoura experimental e geramos 2 mil fotos. Precisávamos de ajuda para classificar as imagens e contar ocorrências por semana.",
    resultadoEsperado: "Relatório final com contagem semanal por praga.",
    status: "concluida",
    habilidades: ["Analise de dados", "Campo"],
    links: ["https://github.com/exemplo/pragas"],
    resultadoUrl: "https://github.com/exemplo/pragas-relatorio",
    diasAtras: 20,
  },
  {
    titulo: "Grupo de estudos de cálculo (pausado)",
    area: "Engenharia",
    problema:
      "Grupo de estudos de cálculo 2 que se reunia às sextas. Foi pausado por falta de sala e deve voltar no próximo semestre.",
    resultadoEsperado: "Retomar encontros semanais.",
    status: "arquivada",
    habilidades: ["Escrita"],
    diasAtras: 40,
  },
];

const [user] = await db.select().from(usuarios).where(eq(usuarios.email, EMAIL)).limit(1);
if (!user) throw new Error(`seed: usuario ${EMAIL} nao encontrado; faca login via /dev/login primeiro`);

const titles = SEEDS.map((s) => s.titulo);
const existing = await db
  .select({ id: demandas.id })
  .from(demandas)
  .where(inArray(demandas.titulo, titles));
const existingIds = existing.map((r) => r.id);
if (existingIds.length > 0) {
  await db.delete(demandaHabilidades).where(inArray(demandaHabilidades.demandaId, existingIds));
  await db.delete(demandaLinks).where(inArray(demandaLinks.demandaId, existingIds));
  await db.delete(demandas).where(inArray(demandas.id, existingIds));
  console.log(`seed: removidas ${existingIds.length} demandas anteriores`);
}

for (const s of SEEDS) {
  const id = crypto.randomUUID();
  const createdAt = new Date(Date.now() - s.diasAtras * 86_400_000);
  await db.insert(demandas).values({
    id,
    responsavelId: user.id,
    titulo: s.titulo,
    area: s.area,
    problema: s.problema,
    resultadoEsperado: s.resultadoEsperado,
    status: s.status,
    resultadoUrl: s.resultadoUrl,
    createdAt,
  });
  await db
    .insert(demandaHabilidades)
    .values(s.habilidades.map((habilidade) => ({ demandaId: id, habilidade })));
  if (s.links) {
    await db.insert(demandaLinks).values(s.links.map((url) => ({ demandaId: id, url })));
  }
}

console.log(`seed: ${SEEDS.length} demandas para ${EMAIL} (4 no feed padrao, 1 concluida, 1 arquivada)`);
process.exit(0);
