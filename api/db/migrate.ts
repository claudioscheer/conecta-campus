import { existsSync } from "node:fs";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { client, db } from "./index";

const migrationsFolder = "./db/migrations";

try {
  if (!existsSync(migrationsFolder)) {
    console.log("Nenhuma pasta de migração encontrada em ./db/migrations. Execute 'bun run db:generate' primeiro.");
  } else {
    console.log("Aplicando migrações...");
    await migrate(db, { migrationsFolder });
    console.log("Migrações aplicadas com sucesso!");
  }
  await client.end();
  process.exit(0);
} catch (error) {
  console.error("Erro ao aplicar migrações:", error);
  await client.end({ timeout: 1 });
  process.exit(1);
}
