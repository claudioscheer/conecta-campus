import { sql } from "drizzle-orm";
import { db } from "../db";

const PORT = Number(process.env.PORT ?? 3000);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/v1/health") {
      try {
        await db.execute(sql`SELECT 1`);
        return Response.json({ status: "ok" });
      } catch (error) {
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

    // ATENÇÃO: Rota temporária de desenvolvimento. Deve ser removida no futuro antes de ir para produção.
    // Usada apenas para obter o ID Token real do Google para testes locais.
    if (req.method === "GET" && (url.pathname === "/dev/login" || url.pathname === "/dev/login/")) {
      const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
      const template = await Bun.file(new URL("./dev-login.html", import.meta.url)).text();
      const html = template.replace("__GOOGLE_CLIENT_ID__", clientId);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }

    return Response.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Rota fora do contrato V1.",
        },
      },
      { status: 404 },
    );
  },
});

console.log(`Conecta Campus API em http://localhost:${server.port}`);
