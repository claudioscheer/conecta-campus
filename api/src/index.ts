import { handleRequest } from "./routes";
import { env } from "./env";

const server = Bun.serve({
  port: env.PORT,
  fetch(req) {
    return handleRequest(req);
  },
});

console.log(`Conecta Campus API em http://localhost:${server.port}`);
