import { describe, expect, it } from "bun:test";
import { sql } from "drizzle-orm";
import { db } from "../db";

describe("Health Check e Conexão com o Banco", () => {
  it("deve responder ao ping no banco de dados via Drizzle", async () => {
    const result = await db.execute(sql`SELECT 1 as ping`);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
