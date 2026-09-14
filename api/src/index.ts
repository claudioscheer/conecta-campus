import { handleRequest } from "./routes";

const PORT = Number(process.env.PORT ?? 3000);

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    return handleRequest(req);
  },
});

console.log(`Conecta Campus API em http://localhost:${server.port}`);
