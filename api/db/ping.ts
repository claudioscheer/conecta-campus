import { sql } from "drizzle-orm";
import { client, db } from "./index";

try {
  await db.execute(sql`SELECT 1`);
  console.log("Banco de dados conectado com sucesso! (SELECT 1)");
  await client.end();
  process.exit(0);
} catch (error) {
  console.error("Erro ao conectar ao banco de dados:", error);
  await client.end({ timeout: 1 });
  process.exit(1);
}
