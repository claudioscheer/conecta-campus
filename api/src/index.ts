const PORT = Number(process.env.PORT ?? 3000);

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/v1/health") {
      return Response.json({ status: "ok" });
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
