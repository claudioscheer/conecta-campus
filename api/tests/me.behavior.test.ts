import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { handleRequest } from "../src/routes";
import { signAppToken } from "../src/lib/jwt";
import { db } from "../db";
import { usuarios } from "../db/schema";

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

interface UserResponseBody {
  id: string;
  nome: string;
  email: string;
  papel: string;
  curso?: string;
  semestre?: string;
}

describe("RF-01 / RF-02 · Perfil da sessão (GET /v1/me)", () => {
  it("deve retornar 401 UNAUTHORIZED se o header Authorization estiver ausente", async () => {
    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Token de autenticação ausente ou inválido.");
  });

  it("deve retornar 401 UNAUTHORIZED se o header Authorization não for Bearer", async () => {
    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
      headers: { Authorization: "Basic 12345" },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Token de autenticação ausente ou inválido.");
  });

  it("deve retornar 401 UNAUTHORIZED se o token Bearer for inválido ou forjado", async () => {
    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
      headers: { Authorization: "Bearer token-falso" },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Token expirado ou inválido.");
  });

  it("deve retornar 401 UNAUTHORIZED se o token tiver ID de usuário que não existe no banco", async () => {
    const fakeToken = await signAppToken({
      id: "uuid-inexistente-no-banco",
      email: "fake@setrem.com.br",
      papel: "aluno",
      nome: "Fake User",
    });

    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${fakeToken}` },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(401);
    const body = (await res.json()) as ErrorResponseBody;
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.message).toBe("Usuário não encontrado.");
  });

  it("deve retornar 200 OK com os dados do usuário autenticado", async () => {
    const testSub = `google-sub-me-${Date.now()}`;
    const testEmail = `me.teste.${Date.now()}@setrem.com.br`;

    const [user] = await db
      .insert(usuarios)
      .values({
        id: crypto.randomUUID(),
        googleSub: testSub,
        nome: "Ana Souza",
        email: testEmail,
        papel: "professor",
        curso: "Sistemas de Informação",
        semestre: "6",
      })
      .returning();

    const validToken = await signAppToken({
      id: user.id,
      email: user.email,
      papel: user.papel,
      nome: user.nome,
    });

    const req = new Request("http://localhost:3000/v1/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await handleRequest(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as UserResponseBody;

    expect(body).toEqual({
      id: user.id,
      nome: "Ana Souza",
      email: testEmail,
      papel: "professor",
      curso: "Sistemas de Informação",
      semestre: "6",
    });

    // Limpa banco
    await db.delete(usuarios).where(eq(usuarios.id, user.id));
  });
});
