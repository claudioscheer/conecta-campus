import { describe, expect, it } from "bun:test";
import { handleRequest } from "../src/routes";

describe("Roteamento e Handlers da API", () => {
  it("deve responder 200 no GET /v1/health", async () => {
    const req = new Request("http://localhost:3000/v1/health");
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body).toEqual({ status: "ok" });
  });

  it("deve responder 200 no GET /dev/login servindo HTML", async () => {
    const req = new Request("http://localhost:3000/dev/login");
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/html");
    const text = await res.text();
    expect(text).toContain("https://accounts.google.com/gsi/client");
  });

  it("deve rotear POST /v1/auth e não retornar 404", async () => {
    const req = new Request("http://localhost:3000/v1/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await handleRequest(req);
    expect(res.status).not.toBe(404);
  });

  it("deve rotear GET /v1/me e não retornar 404", async () => {
    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
    });
    const res = await handleRequest(req);
    expect(res.status).not.toBe(404);
  });

  it("deve responder 404 para rotas fora do contrato V1", async () => {
    const req = new Request("http://localhost:3000/v1/inexistente");
    const res = await handleRequest(req);
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
