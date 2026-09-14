import { sql } from "drizzle-orm";
import { db } from "../../db";

export async function handleHealth(): Promise<Response> {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ status: "ok" });
  } catch {
    return Response.json(
      {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "Não foi possível conectar ao banco de dados.",
        },
      },
      { status: 503 },
    );
  }
}
