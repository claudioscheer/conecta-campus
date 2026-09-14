import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ERRO FATAL: A variável de ambiente DATABASE_URL não foi informada.");
  process.exit(1);
}

export const client = postgres(databaseUrl);
export const db = drizzle(client, { schema });
