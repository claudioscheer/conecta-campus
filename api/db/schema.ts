import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const papelEnum = pgEnum("papel", ["aluno", "professor", "moderador"]);

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
