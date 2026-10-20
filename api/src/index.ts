import { handleRequest } from "./routes";
import { env } from "./env";

const server = Bun.serve({
  port: env.PORT,
  async fetch(req: Request): Promise<Response> {
    const start = Date.now();
    const url = new URL(req.url);
    const path = `${url.pathname}${url.search}`;
    try {
      const res = await handleRequest(req);
      console.log(`${req.method} ${path} -> ${res.status} (${Date.now() - start}ms)`);
      return res;
    } catch (err) {
      console.error(`${req.method} ${path} -> 500 (${Date.now() - start}ms)`, err);
      return Response.json(
        {
          error: {
            code: "SERVER_ERROR",
            message: "Erro interno.",
          },
        },
        { status: 500 },
      );
    }
  },
});

console.log(`Conecta Campus API em http://localhost:${server.port}`);
