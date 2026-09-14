import { handleHealth } from "./handlers/health";
import { handleDevLogin } from "./handlers/dev-login";

type RouteHandler = (req: Request, url: URL) => Promise<Response> | Response;

interface Route {
  method: string;
  match: (pathname: string) => boolean;
  handler: RouteHandler;
}

const routes: Route[] = [
  {
    method: "GET",
    match: (pathname) => pathname === "/v1/health",
    handler: () => handleHealth(),
  },
  // Rota temporária de desenvolvimento
  {
    method: "GET",
    match: (pathname) => pathname === "/dev/login" || pathname === "/dev/login/",
    handler: () => handleDevLogin(),
  },
];

export async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);

  for (const route of routes) {
    if (route.method === req.method && route.match(url.pathname)) {
      return route.handler(req, url);
    }
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
}
