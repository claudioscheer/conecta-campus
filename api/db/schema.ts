import { pgTable, text, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";

export const papelEnum = pgEnum("papel", ["aluno", "professor", "moderador"]);
export const demandaStatusEnum = pgEnum("demanda_status", [
  "aberta",
  "em_andamento",
  "concluida",
  "arquivada",
  "cancelada",
]);

export const usuarios = pgTable("usuarios", {
  id: text("id").primaryKey(),
  googleSub: text("google_sub").notNull().unique(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  papel: papelEnum("papel").notNull().default("aluno"),
  curso: text("curso"),
  semestre: text("semestre"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type UsuarioRecord = typeof usuarios.$inferSelect;
export type NewUsuarioRecord = typeof usuarios.$inferInsert;

export const demandas = pgTable("demandas", {
  id: text("id").primaryKey(),
  responsavelId: text("responsavel_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  titulo: text("titulo").notNull(),
  area: text("area").notNull(),
  problema: text("problema").notNull(),
  resultadoEsperado: text("resultado_esperado").notNull(),
  status: demandaStatusEnum("status").notNull().default("aberta"),
  resultadoUrl: text("resultado_url"),
  hiddenAt: timestamp("hidden_at", { withTimezone: true }),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const demandaHabilidades = pgTable(
  "demanda_habilidades",
  {
    demandaId: text("demanda_id")
      .notNull()
      .references(() => demandas.id, { onDelete: "cascade" }),
    habilidade: text("habilidade").notNull(),
  },
  (t) => [primaryKey({ columns: [t.demandaId, t.habilidade] })],
);

export const demandaLinks = pgTable(
  "demanda_links",
  {
    demandaId: text("demanda_id")
      .notNull()
      .references(() => demandas.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
  },
  (t) => [primaryKey({ columns: [t.demandaId, t.url] })],
);

export type DemandaRecord = typeof demandas.$inferSelect;
